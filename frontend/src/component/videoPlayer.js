
import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../interceptor/axiosInstance';
import { Mutex } from 'async-mutex';

/*
 * video_info = {
 *  path: str (in seaweed)
 *  chunks_no: uint
 *  chuncks: [ -> .m3u8
 *     duration: double
 *     duration: double
 *     ....
 *     duration: double
 *     duration: double
 *  ]
 * }
 * 
 * 
 * init.mp4 -> seaweedfs
 */

export const VideoPlayer = ({ video_info }) => {
    const BYTE_TO_MB = 10e+5;
    const MAX_MSE_BUFFER_SIZE_IN_MB = 20
    const videoRef = useRef([]);
    let [mediaSource, setMediaSource] = useState(null);
    let [currentTime, setCurrentTime] = useState(0);
    let sourceBuffer = null;
    let sbMutex = new Mutex();
    let seekMutex = new Mutex();

    useEffect(() => {
        if (videoRef.current) {
            const newMediaSource = new MediaSource();
            videoRef.current.src = URL.createObjectURL(newMediaSource);
            setMediaSource(newMediaSource);
        }
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = currentTime;
        }
    }, [currentTime])

    useEffect(() => {
        console.log("useEffect mediaSource")
        if (mediaSource) {
            mediaSource.onsourceended = () => {
                console.log('media source ended')
            }

            mediaSource.onsourceclose = () => {
                console.log('media source closed')
            }

            mediaSource.onsourceopen = async () => {
                console.info(`- onsourceopen - ${mediaSource.readyState} should be 'open'`); // open

                sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001f, mp4a.40.2"');

                sourceBuffer.onabort = () => {
                    console.log('source buffer on abort')
                }

                let allChunks = {};

                // console.log("video path" + video_info.path)

                const durationsFetch = async () => {
                    let url = `http://192.168.0.190:8888${video_info.path}/out.m3u8`;
                    const accessToken = localStorage.getItem('access_token');
                    const config = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                    };
                    let data = (await axiosInstance.get(url, config)).data;
                    return data.split('\n').filter((v) => { return v.startsWith('#EXTINF') }).map((v) => parseFloat(v.split(":")[1]))
                };

                const durations = await durationsFetch();

                const initFetch = async () => {
                    let url = `http://192.168.0.190:8888${video_info.path}/init.mp4`;
                    const accessToken = localStorage.getItem('access_token');
                    const config = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        responseType: 'arraybuffer'
                    };
                    return (await axiosInstance.get(url, config)).data;
                };

                const chunkFetch = async (chunk_idx) => {
                    const url_tok = video_info.path.split('/');
                    const vid_name = url_tok[url_tok.length - 1];
                    const vid_name_wo_extension = vid_name.split('.')[0]
                    let url = `http://192.168.0.190:8888${video_info.path}/${vid_name_wo_extension}_${chunk_idx}.mp4`;
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
                        throw error;
                    }
                };


                const loadInit = async () => {
                    await sbMutex.acquire()
                    let fetchedChunk = await initFetch(-1);
                    await new Promise((resolve) => {
                        sourceBuffer.onupdateend = resolve
                        sourceBuffer.appendBuffer(fetchedChunk)
                    });
                    sbMutex.release()
                }

                const loadChunk = async (chunk_idx) => {
                    await sbMutex.acquire()

                    let fetchedChunk = null
                    if (!(chunk_idx in allChunks)) {
                        fetchedChunk = await chunkFetch(chunk_idx);
                        allChunks[chunk_idx] = fetchedChunk;
                    } else {
                        fetchedChunk = allChunks[chunk_idx];
                    }

                    await new Promise((resolve) => {
                        sourceBuffer.onupdateend = resolve
                        sourceBuffer.appendBuffer(fetchedChunk)
                    });

                    sbMutex.release()
                }

                const getChunk = (time) => {
                    let currDur = 0;
                    for (let i = 0; i < durations.length; i++) {
                        currDur += durations[i];
                        if (time < currDur) {
                            return i;
                        }
                    }
                    return undefined;
                }

                const removeTimeRange = async (start, end) => {
                    await sbMutex.acquire()

                    await new Promise((resolve) => {
                        sourceBuffer.onupdateend = resolve
                        sourceBuffer.remove(start, end)
                        console.log(`removed from ${start} to ${end} `)
                    });

                    sbMutex.release()
                }

                const isChunkLoaded = async (time) => {
                    let buff = sourceBuffer.buffered;
                    for (let i = 0; i < sourceBuffer.buffered.length; i++) {
                        if (buff.start(i) <= time && time < buff.end(i)) {
                            return true;
                        }
                    }
                    return false;
                }

                const printTimeRanges = () => {
                    let buff = sourceBuffer.buffered;
                    for (let i = 0; i < sourceBuffer.buffered.length; i++) {
                        console.debug(buff.start(i), buff.end(i))
                    }
                }

                videoRef.current.ontimeupdate = async (event) => {
                    try {
                        if (mediaSource.readyState === 'ended') { return; }

                        const time = videoRef.current.currentTime;

                        if (time >= mediaSource.duration - 0.250) {
                            videoRef.current.pause()
                            return
                        }

                        if (await isChunkLoaded(time + 2)) { return; }

                        const chunk_idx = getChunk(time + 2);
                        if (chunk_idx === undefined) {
                            // mediaSource.endOfStream();
                            return;
                        }
                        await loadChunk(chunk_idx);
                        // await loadChunk(chunk_idx + 1);
                        
                        await removeTimeRange(0, Math.max(0.0001, time - 10));
                    } catch (e) { }
                }

                videoRef.current.onseeking = async (event) => {
                    await seekMutex.acquire();
                    const time = videoRef.current.currentTime;

                    // console.log('time', time)
                    // await videoRef.current.pause();
                    try {

                        const loaded = await isChunkLoaded(time);

                        // console.log('loaded', loaded)

                        if (loaded) { 
                            seekMutex.release(); 
                            return; 
                        } 

                        // await removeTimeRange(0, Math.max(0.01, mediaSource.duration));
                        await removeTimeRange(0, Math.max(0.01, time - 10));

                        const chunk_idx = getChunk(time);

                        // console.log(time, chunk_idx)

                        if (chunk_idx === undefined) {
                            seekMutex.release()
                            return;
                        }


                        await loadChunk(chunk_idx);
                        await loadChunk(chunk_idx+1);


                        await removeTimeRange(0, Math.max(0.01, time - 10));

                        // await videoRef.current.pause()
                        // setCurrentTime(videoRef.current.currentTime);
                        // const newMediaSource = new MediaSource();
                        // videoRef.current.src = URL.createObjectURL(newMediaSource);
                        // setMediaSource(newMediaSource);

                        // await videoRef.current.play();
                    }finally {
                        seekMutex.release()

                    }

                }

                videoRef.current.onplay = async (event) => {
                    // console.log('play')
                    if (videoRef.current.currentTime >= mediaSource.duration - 0.250) {
                        videoRef.current.play()
                        videoRef.current.currentTime = 0;
                    }
                }

                mediaSource.duration = durations.reduce((acc, x) => acc + x);

                {
                    let dur = 0;
                    for (let i = 0; i < durations.length; i++) {
                        let old_dur = dur
                        dur += durations[i]
                        console.log(i, old_dur, dur)
                    }
                }

                await loadInit();

                console.debug(durations);
                await loadChunk(0);
            }
        }
    }, [mediaSource]);

    return (
        <video
            ref={(elem) => videoRef.current = elem}
            controls

            muted={false}
            style={{ objectFit: "cover", width: '100%' }}
            // style={{
            //     objectFit: "cover",
            //     width: `100%`,
            //     height: `70vh`,
            //     position:'relative',
            //     zIndex:2
            // }}
            src={null}
        />
    );
};


