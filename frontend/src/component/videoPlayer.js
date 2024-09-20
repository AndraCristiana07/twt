
import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../interceptor/axiosInstance';
import { Mutex } from 'async-mutex';


export const VideoPlayer = ({ duration, seaweedfs_entry }) => {
    const BYTE_TO_MB = 10e+5;
    const MAX_MSE_BUFFER_SIZE_IN_MB = 20
    const videoRef = useRef([]);
    let [mediaSource, setMediaSource] = useState(null);
    let currentTime = 0;
    let sourceBuffer = null;
    let sbMutex = new Mutex();

    useEffect(() => {
        if (videoRef.current) {
            const newMediaSource = new MediaSource();
            videoRef.current.src = URL.createObjectURL(newMediaSource);
            setMediaSource(newMediaSource);
        }
    }, []);

    useEffect(() => {
        console.log("useEffect mediaSource")
        try {
            if (mediaSource) {

                var time = duration.split(":")

                var durationSeconds = parseInt(time[0]) * 3600 + parseInt(time[1]) * 60 + parseInt(time[2].split('.')[0]) + parseInt(time[2].split('.')[1]) * 0.001;

                console.log("duration for vid " + durationSeconds)
                const videoChunks = seaweedfs_entry.chunks;

                mediaSource.onsourceended = () => {
                    console.log('media source ended')
                }

                mediaSource.onsourceclose = () => {
                    console.log('media source closed')
                }

                mediaSource.onsourceopen = async () => {
                    console.info(`- onsourceopen - ${mediaSource.readyState} should be 'open'`); // open
                    // console.log(MediaSource.isTypeSupported('video/mp4; codecs="avc1.64001f, mp4a.40.2"'))

                    console.debug(JSON.stringify(mediaSource.sourceBuffers))

                    sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001f, mp4a.40.2"');

                    sourceBuffer.onabort = () => {
                        console.log('source buffer on abort')
                    }

                    mediaSource.duration = durationSeconds
                    let currSize = 0;
                    let start = 0;
                    let last_chunk_loaded = -1;

                    const vidSize = videoChunks.reduce((acc, vid) => {
                        return acc + vid.size
                    }, 0)

                    const loadChunk = async (chunk_idx, debug) => {
                        if (chunk_idx >= videoChunks.length) {
                            console.error(`Index ${chunk_idx} outside of range`)
                            return;
                        }

                        const chunk = videoChunks[chunk_idx];
                        const fetchedChunk = await videoFetch(chunk.file_id);
                        if (!fetchedChunk) {
                            console.error(`Could not fetch chunk ${chunk_idx}`)
                            return;
                        }

                        await sbMutex.acquire()

                        await new Promise((resolve, reject) => {
                            // console.log(`start. fetching chunk ${chunk.file_id} - ${videoChunks.indexOf(chunk)} / ${videoChunks.length}. Size ${currSize}`);
                            const handleUpdateEnd = () => {
                                sourceBuffer.removeEventListener('updateend', handleUpdateEnd);
                                console.debug(`--- loadChunk - added segment ${chunk_idx}`, debug)
                                resolve();
                            };
                            sourceBuffer.onupdateend = handleUpdateEnd
                            sourceBuffer.appendBuffer(fetchedChunk)
                            // const updateHandler = () => {
                            //     sourceBuffer.removeEventListener('updateend', updateHandler);
                            //     resolve();
                            // }
                            // sourceBuffer.addEventListener('updateend', updateHandler);
                            // sourceBuffer.appendBuffer(fetchedChunk);

                        });


                        let buff = sourceBuffer.buffered
                        console.debug('--- loadChunk -', debug, buff, sourceBuffer.appendWindowStart, sourceBuffer.timestampOffset)
                        for (let i = 0; i < buff.length; i++) {
                            console.debug('--- loadChunk -', debug, buff.start(i), buff.end(i))
                        }

                        sbMutex.release()
                    }
                    const removeContent = async (from, to, debug) => {
                        console.debug('---- removeContent', debug, `removing content from ${from} to ${to}`)

                        await sbMutex.acquire()

                        await new Promise((resolve) => {
                            sourceBuffer.onupdateend = () => {
                                console.debug('---- removeContent', debug, `content removed from ${from} to ${to}`)
                                resolve()
                            }
                            sourceBuffer.remove(from, to)
                        })

                        sbMutex.release()
                    }

                    const getCurrentChunk = async (currentTime) => {
                        let currChunk = -1;
                        videoChunks.reduce((acc, vid, idx) => {
                            // console.debug(currChunk)
                            if (acc * durationSeconds / vidSize <= currentTime) {
                                // console.debug(acc * durationSeconds / vidSize, currTime)
                                currChunk = idx;
                            }
                            return acc + vid.size;
                        }, 0);
                        return currChunk;
                    }


                    videoRef.current.ontimeupdate = async (event) => {
                        const currTime = videoRef.current.currentTime;
                        console.debug("- ontimeupdate " + currTime)

                        let next = currTime + 20;
                        // console.debug(next, durationSeconds)
                        if (next < durationSeconds && !sourceBuffer.updating) {
                            if (last_chunk_loaded + 1 >= videoChunks.length) {
                                return;
                            }

                            const chunk = videoChunks[last_chunk_loaded + 1];
                            // currSize += chunk.size
                            // console.debug(currSize + chunk.size / BYTE_TO_MB)

                            // console.debug(currSize)

                            if ((currSize + chunk.size) / BYTE_TO_MB > MAX_MSE_BUFFER_SIZE_IN_MB) {
                                // remove segment
                                if (currTime > start && !sourceBuffer.updating) {
                                    const end = currTime - 20

                                    if (end > start && !sourceBuffer.updating) {
                                        // console.log("- ontimeupdate - clean segment")
                                        await removeContent(start, end, 'ontimeupdate')
                                        currSize -= (end - start) * vidSize / durationSeconds;
                                        start = end;
                                        // currSize -= chunk.size / BYTE_TO_MB;
                                    }
                                }

                                return;
                            }


                            const currentMaxTime = videoChunks.reduce((acc, vid, idx) => {
                                if (idx <= last_chunk_loaded) {
                                    return acc + vid.size
                                }
                                return acc;
                            }, 0) * durationSeconds / vidSize;

                            // console.log(next, currentMaxTime)
                            if (next < currentMaxTime) {
                                return;
                            }


                            last_chunk_loaded++;
                            currSize += chunk.size;


                            // await loadChunk(videoChunks.indexOf(chunk))
                            await loadChunk(last_chunk_loaded, 'ontimeupdate');

                        }
                    }

                    videoRef.current.onseeking = async (event) => {
                        const wasPaused = videoRef.current.paused
                        if (!wasPaused) {
                            await videoRef.current.pause();
                            console.debug("video paused")
                        }
                        sourceBuffer.abort();

                        console.debug("Seek")

                        console.log(sourceBuffer)


                        const currTime = videoRef.current.currentTime;
                        let currChunk = await getCurrentChunk(currTime);


                        await removeContent(0, durationSeconds, 'onseeking')


                        last_chunk_loaded = Math.max(0, currChunk + 1);
                        // await loadChunk(last_chunk_loaded, "onseeking")
                        console.log(last_chunk_loaded)
                        await loadChunk(0, "onseeking")
                        for (let i = 1; i < last_chunk_loaded; i++) {
                            await loadChunk(i, "onseeking")
                            if (sourceBuffer.buffered.length > 0)
                                removeContent(0, sourceBuffer.buffered.end(0) - 5, "aaa")
                        }
                        await loadChunk(last_chunk_loaded, "onseeking")

                        // await sbMutex.acquire()
                        // sourceBuffer.timestampOffset = loadChunk0;
                        // sourceBuffer.appendWindowStart = currTime - 1;
                        // sourceBuffer.appendWindowEnd = durationSeconds;
                        // sbMutex.release()


                        if (!wasPaused) {
                            console.debug("-- onseeking - video resuming")
                            await videoRef.current.play();
                            console.debug("-- onseeking - video resumed")
                        }
                        // sourceBuffer.abort()

                        // console.debug(`- skipping to chunk ${currChunk}`)
                        // last_chunk_loaded = currChunk;


                        // sourceBuffer = null
                        // mediaSource = null
                        // setMediaSource(null)

                        // await loadChunk(currChunk);

                    }


                    {
                        last_chunk_loaded = await getCurrentChunk(currentTime);
                        await loadChunk(last_chunk_loaded, 'first chunk')
                    }
                    videoRef.current.currentTime = 29;

                    // mediaSource.endOfStream();
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, [mediaSource]);



    // 18 sept 13:00
    // useEffect(() => {
    //     console.log("useEffect mediaSource")
    //     try {
    //         if (mediaSource) {

    //             var time = duration.split(":")

    //             var durationSeconds = parseInt(time[0]) * 3600 + parseInt(time[1]) * 60 + parseInt(time[2].split('.')[0]) + parseInt(time[2].split('.')[1]) * 0.001;

    //             console.log("duration for vid " + durationSeconds)
    //             const videoChunks = seaweedfs_entry.chunks;

    //             mediaSource.onsourceended = () => {
    //                 console.log('media source ended')
    //             }

    //             mediaSource.onsourceclose = () => {
    //                 console.log('media source closed')
    //             }

    //             mediaSource.onsourceopen = async () => {
    //                 console.info(`- onsourceopen - ${mediaSource.readyState} should be 'open'`); // open
    //                 // console.log(MediaSource.isTypeSupported('video/mp4; codecs="avc1.64001f, mp4a.40.2"'))

    //                 console.debug(JSON.stringify(mediaSource.sourceBuffers))

    //                 let sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001f, mp4a.40.2"');

    //                 sourceBuffer.onabort = () => {
    //                     console.log('source buffer on abort')
    //                 }

    //                 mediaSource.duration = durationSeconds
    //                 let currSize = 0;
    //                 let start = 0;
    //                 let last_chunk_loaded = -1;

    //                 const vidSize = videoChunks.reduce((acc, vid) => {
    //                     return acc + vid.size
    //                 }, 0)

    //                 const loadChunk = async (chunk_idx) => {
    //                     if (!sourceBuffer) return;

    //                     if (chunk_idx >= videoChunks.length) {
    //                         return;
    //                     }

    //                     const chunk = videoChunks[chunk_idx];
    //                     const fetchedChunk = await videoFetch(chunk.file_id);
    //                     if (!fetchedChunk) {
    //                         return;
    //                     }

    //                     await new Promise((resolve) => {
    //                         // console.log(`start. fetching chunk ${chunk.file_id} - ${videoChunks.indexOf(chunk)} / ${videoChunks.length}. Size ${currSize}`);

    //                         sourceBuffer.onupdateend = () => {
    //                             //     console.debug(`Added segment ${chunk_idx}`)
    //                             resolve();
    //                         };
    //                         sourceBuffer.appendBuffer(fetchedChunk)
    //                     });
    //                 }

    //                 const getCurrentChunk = async (currentTime) => {
    //                     let currChunk = -1;
    //                     videoChunks.reduce((acc, vid, idx) => {
    //                         // console.debug(currChunk)
    //                         if (acc * durationSeconds / vidSize <= currentTime) {
    //                             // console.debug(acc * durationSeconds / vidSize, currTime)
    //                             currChunk = idx;
    //                         }
    //                         return acc + vid.size;
    //                     }, 0);
    //                     return currChunk;
    //                 }


    //                 videoRef.current.ontimeupdate = async (event) => {
    //                     const currTime = videoRef.current.currentTime;
    //                     console.debug("- ontimeupdate " + currTime)

    //                     let next = currTime + 20;
    //                     // console.debug(next, durationSeconds)
    //                     if (next < durationSeconds && !sourceBuffer.updating) {
    //                         if (last_chunk_loaded + 1 >= videoChunks.length) {
    //                             return;
    //                         }

    //                         const chunk = videoChunks[last_chunk_loaded + 1];
    //                         // currSize += chunk.size
    //                         // console.debug(currSize + chunk.size / BYTE_TO_MB)

    //                         console.debug(currSize)

    //                         if ((currSize + chunk.size) / BYTE_TO_MB > MAX_MSE_BUFFER_SIZE_IN_MB) {
    //                             // remove segment
    //                             if (currTime > start && !sourceBuffer.updating) {
    //                                 const end = currTime - 20

    //                                 if (end > start) {
    //                                     // console.log("- ontimeupdate - clean segment")
    //                                     sourceBuffer.remove(start, end)
    //                                     currSize -= (end - start) * vidSize / durationSeconds;
    //                                     console.log(`- ontimeupdate - removed from ${start} to ${end}`)
    //                                     start = end;
    //                                     // currSize -= chunk.size / BYTE_TO_MB;
    //                                 }
    //                             }

    //                             return;
    //                         }


    //                         const currentMaxTime = videoChunks.reduce((acc, vid, idx) => {
    //                             if (idx <= last_chunk_loaded) {
    //                                 return acc + vid.size
    //                             }
    //                             return acc;
    //                         }, 0) * durationSeconds / vidSize;

    //                         console.log(next, currentMaxTime)
    //                         if (next < currentMaxTime) {
    //                             return;
    //                         }


    //                         last_chunk_loaded++;
    //                         currSize += chunk.size;


    //                         await loadChunk(videoChunks.indexOf(chunk))
    //                     }
    //                 }

    //                 videoRef.current.onseeking = async (event) => {

    //                     console.debug("Seek")

    //                     console.log(sourceBuffer)

    //                     const currTime = videoRef.current.currentTime;


    //                     let currChunk = await getCurrentChunk(currTime);

    //                     sourceBuffer.abort()

    //                     await new Promise(resolve => {
    //                         sourceBuffer.onupdateend = () => {
    //                             // sourceBuffer.abort()

    //                             resolve()
    //                         }
    //                         sourceBuffer.remove(0, durationSeconds)
    //                     })




    //                     console.debug(`- skipping to chunk ${currChunk}`)
    //                     last_chunk_loaded = currChunk;

    //                     videoRef.current.pause()

    //                     // sourceBuffer = null
    //                     // mediaSource = null
    //                     // setMediaSource(null)

    //                     // sourceBuffer.timestampOffset = currTime;

    //                     // await loadChunk(currChunk);

    //                 }


    //                 {
    //                     last_chunk_loaded = await getCurrentChunk(currentTime);
    //                     await loadChunk(last_chunk_loaded)
    //                 }

    //                 // if (currSize > 110) {
    //                 //     await new Promise((resolve) => {
    //                 //         console.log(`start. fetching chunk ${chunk.file_id} - ${videoChunks.indexOf(chunk)} / ${videoChunks.length}. Size ${currSize}`);

    //                 //         sourceBuffer.onupdateend = () => {
    //                 //             console.log('Chunk appended successfully');
    //                 //             resolve();
    //                 //         };
    //                 //         sourceBuffer.onupdatestart = () => {
    //                 //             console.log('start update');
    //                 //         }
    //                 //         sourceBuffer.onerror = (err) => {
    //                 //             console.error('sourceBuffer error:', err)
    //                 //         };
    //                 //         sourceBuffer.remove()
    //                 //         sourceBuffer.appendBuffer(fetchedChunk);
    //                 //         const lastFetchedChunk = videoChunks.indexOf(chunk)
    //                 //         console.log("last fetched " + lastFetchedChunk)



    //                 //     });
    //                 //     }
    //                 // }

    //                 // mediaSource.endOfStream();
    //             }
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }, [mediaSource]);

    const videoFetch = async (path) => {
        const url = `http://192.168.0.138:8080/${path}`;
        const accessToken = localStorage.getItem('access_token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            responseType: 'arraybuffer'
        };
        try {
            const response = await axiosInstance.get(url, config);
            return response.data;
        } catch (error) {
            console.error('Error fetching video ', error);
        }
    };

    return (
        <video
            ref={(elem) => videoRef.current = elem}
            controls

            muted={false}
            style={{ objectFit: "cover", width: '100%' }}
            src={null}
        />
    );
};


