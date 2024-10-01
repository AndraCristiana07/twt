import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { VideoPlayer } from './videoPlayer';

export const ImagesGrid = ({ tweet, media }) => {
    const navigate = useNavigate();
    const mediaUrls = tweet.image_urls
    let gridSize = [150, 300] // w&h
    const handleImageNav = (tweet, index) => {
        navigate(`/tweet/${tweet.id}/images/${index}`);
    }

    // console.log("media urls for grid" + mediaUrls[0])
    // console.log("images" + media)
    if (mediaUrls.length === 1 ) {
        let duration_index = 0

        return <div id='media-grid' style={{ padding: "5%", justifyContent: 'center' }}>
            {/* {(media[0].endsWith('.png') || media[0].endsWith('.jpg') || media[0].endsWith('.jpeg') )&& (  */}
            {media[0] && (
                <img key={0} src={media[0]} alt="tweet image" className="grid-image"
                onClick={(e) => {
                    e.stopPropagation();
                    handleImageNav(tweet, 0)
                }}
                style={{
                    objectFit: "cover",
                    width: `100%`,
                    height: `100%`
                }}
                />
            )}
            {mediaUrls[0].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>
                    <VideoPlayer
                        key={0}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `100%`,
                            height: `100%`
                        }}
                    />
                </div>
            )}
        
        </div>
    }
    if (mediaUrls.length === 2) {
        let duration_index = 0

        return <div id='media-grid' style={{ padding: "5%", justifyContent: 'center' }}>
            {media[0] && (
                <img key={0} src={media[0]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 0)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
            )}
            {media[1] && (
                <img key={1} src={media[1]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 1)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
            )}
            {mediaUrls[0].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>

                    <VideoPlayer
                        key={0}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `50%`,
                            height: `100%`
                        }}
                    />
                </div>
            )}
            {mediaUrls[1].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>

                    <VideoPlayer
                        key={1}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `50%`,
                            height: `100%`
                        }}
                    />
                </div>
            )}

        </div>
    }
    if (mediaUrls.length === 3) {
        let duration_index = 0

        return <div id='media-grid' style={{ padding: "5%", display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
            <div style={{
                width: `50%`,
                height: `100%`
            }}>
                {media[0] && (
                    <img key={0} src={media[0]} alt="tweet image" className="grid-image"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleImageNav(tweet, 0)
                        }}
                        style={{
                            objectFit: "cover",
                            width: `100%`,
                            height: `100%`
                        }}
                    />
                )}
                {mediaUrls[0].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>

                    <VideoPlayer
                        key={0}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `100%`,
                            height: `100%`
                        }}
                    />
                </div>
                )}
            </div>
            <div style={{
                display: 'flex', flexDirection: 'column',
                width: `50%`,
                height: `100%`
            }}>
                {media[1] && (
                <img key={1} src={media[1]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 1)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `100%`,
                        height: `50%`
                    }}
                />
                )}
                {mediaUrls[1].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>

                    <VideoPlayer
                        key={1}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `100%`,
                            height: `50%`
                        }}
                    />
                </div>
                )}
                {media[2] && (
                <img key={2} src={media[2]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 2)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `100%`,
                        height: `50%`
                    }}
                />
                )}
                {mediaUrls[2].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>
                    <VideoPlayer
                        key={2}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `100%`,
                            height: `50%`
                        }}
                    />
                </div>
                )}
            </div>
        </div>
    }
    if (mediaUrls.length === 4) {
        let duration_index = 0

        return <div id='media-grid' style={{ padding: "5%", display: 'flex', flexDirection: "column", justifyContent: 'center' }}>
            <div style={{
                width: `100%`,
                height: `50%`,
                display: 'flex',
                flexDirection: 'row'
            }}>
            {media[0] && (
                <img key={0} src={media[0]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 0)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
            )}
            {mediaUrls[0].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>
                    <VideoPlayer
                        key={0}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `50%`,
                            height: `100%`
                        }}
                    />
                </div>
            )}
            {media[1] && (
                <img key={1} src={media[1]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 1)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
            )}
            {mediaUrls[1].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>
                <VideoPlayer
                        key={1}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `50%`,
                            height: `100%`
                        }}
                    />
                </div>
            )}
            </div>
            <div style={{
                display: 'flex', flexDirection: 'row',
                width: `100%`,
                height: `50%`
            }}>
                {media[2] && (
                <img key={2} src={media[2]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 2)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
                )}
                {mediaUrls[2].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>

                    <VideoPlayer
                        key={2}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `50%`,
                            height: `100%`
                        }}
                    />
                    </div>
                )}
                {media[3] && (
                <img key={3} src={media[3]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 3)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
                )}
                {mediaUrls[3].endsWith('.mp4') && ( 
                <div onClick={(e)=> e.stopPropagation()}>

                    <VideoPlayer
                        key={3}
                        duration={tweet.duration[duration_index]}
                        video_info={tweet.video_info[duration_index++]}
                        style={{
                            objectFit: "cover",
                            width: `50%`,
                            height: `100%`
                        }}
                    />
                </div>
                )}
            </div>
        </div>
    }
}


// export const ImagesGrid = ({ tweet, media }) => {
//     const navigate = useNavigate();

//     const handleImageNav = (tweet, index) => {
//         navigate(`/tweet/${tweet.id}/images/${index}`);
//     }

//     const renderMedia = (mediaItem, index) => {
//         if (mediaItem.type === 'image') {
//             return (
//                 <img
//                     key={index}
//                     src={mediaItem.src}
//                     alt="tweet media"
//                     className="grid-image"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         handleImageNav(tweet, index)
//                     }}
//                     style={{
//                         objectFit: "cover",
//                         width: '100%',
//                         height: '100%'
//                     }}
//                 />
//             );
//         } else if (mediaItem.type === 'video') {
//             let duration_index = 0
//             return (
//                 <VideoPlayer
//                     key={index}
//                     duration={tweet.duration[duration_index]}
//                     video_info={tweet.video_info[duration_index++]}
//                     className="grid-video"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         handleImageNav(tweet, index)
//                     }}
//                     style={{
//                         width: '100%',
//                         height: '100%'
//                     }}
//                 />
//             );
//         }
//     };

//     if (media.length === 1) {
//         return (
//             <div id='media-grid' style={{ padding: "5%", justifyContent: 'center' }}>
//                 {renderMedia(media[0], 0)}
//             </div>
//         );
//     }

//     if (media.length === 2) {
//         return (
//             <div id='media-grid' style={{ padding: "5%", justifyContent: 'center', display: 'flex' }}>
//                 <div style={{ width: '50%' }}>
//                     {renderMedia(media[0], 0)}
//                 </div>
//                 <div style={{ width: '50%' }}>
//                     {renderMedia(media[1], 1)}
//                 </div>
//             </div>
//         );
//     }

//     if (media.length === 3) {
//         return (
//             <div id='media-grid' style={{ padding: "5%", display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
//                 <div style={{ width: '50%' }}>
//                     {renderMedia(media[0], 0)}
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
//                     <div style={{ height: '50%' }}>
//                         {renderMedia(media[1], 1)}
//                     </div>
//                     <div style={{ height: '50%' }}>
//                         {renderMedia(media[2], 2)}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (media.length === 4) {
//         return (
//             <div id='media-grid' style={{ padding: "5%", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//                 <div style={{ width: '100%', height: '50%', display: 'flex', flexDirection: 'row' }}>
//                     <div style={{ width: '50%' }}>
//                         {renderMedia(media[0], 0)}
//                     </div>
//                     <div style={{ width: '50%' }}>
//                         {renderMedia(media[1], 1)}
//                     </div>
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '50%' }}>
//                     <div style={{ width: '50%' }}>
//                         {renderMedia(media[2], 2)}
//                     </div>
//                     <div style={{ width: '50%' }}>
//                         {renderMedia(media[3], 3)}
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }



    // return (<div>
    //     {/*<h1>WIP</h1>*/}
    //     <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
    //         {images.map((image, index) => (
    //             //     <div key={index}>


    //             //    {handleExtension(image,index)}
    //             //    </div>

    //             <img key={index} src={image} alt="tweet image" className="grid-image"
    //                 onClick={(e) => {
    //                     e.stopPropagation();
    //                     handleImageNav(tweet, index)
    //                 }} // TODO
    //                 style={{ width: `${imageSize[0]}px`, height: `${imageSize[1]}px`, objectFit: "cover" }}
    //             />


    //         ))}
    //     </div>
    // </div>)
// }



// export const ImagesGrid = ({ tweet, media }) => {
//     const navigate = useNavigate();

//     let gridSize = [150, 300] // w&h
//     const handleImageNav = (tweet, index) => {
//         navigate(`/tweet/${tweet.id}/images/${index}`);
//     };

//     const renderMedia = (url, index) => {
//         const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') 
//         const isImage =  url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') 
//         if (isVideo) {
//             return (

//             <video
//                 key={index}
//                 controls
//                 onClick={(e)=> {e.stopPropagation(); handleImageNav(tweet,index)}}
//                 style={{
//                     objectFit: "cover",
//                     width: '100%',
//                     height: '100%'
//                 }}>
//                      <source src={url} type="video/mp4" />

//                 </video>
//             )

//         } else if(isImage) {
//             return (
//                 <img
//                     key={index}
//                     src={url}
//                     alt="tweet media"
//                     className="grid-media"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         handleImageNav(tweet, index);
//                     }}
//                     style={{
//                         objectFit: "cover",
//                         width: '100%',
//                         height: '100%'
//                     }}
//                 />
//             )
//         }
//     };


//     if (media.length === 1) {
//         return (
//             <div id="images-grid" style={{ padding: "5%", justifyContent: 'center' }}>
//                 {renderMedia(media[0], 0)}
//             </div>
//         );
//     }

//     if (media.length === 2) {
//         return (
//             <div id="images-grid" style={{ padding: "5%", justifyContent: 'center' }}>
//                 {renderMedia(media[0], 0)}
//                 {renderMedia(media[1], 1)}
//             </div>
//         );
//     }

//     if (media.length === 3) {
//         return (
//             <div id="images-grid" style={{ padding: "5%", display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
//                 <div style={{ width: '50%', height: '100%' }}>
//                     {renderMedia(media[0], 0)}
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'column', width: '50%', height: '100%' }}>
//                     {renderMedia(media[1], 1)}
//                     {renderMedia(media[2], 2)}
//                 </div>
//             </div>
//         );
//     }

//     if (media.length === 4) {
//         return (
//             <div id="images-grid" style={{ padding: "5%", display: 'flex', flexDirection: "column", justifyContent: 'center' }}>
//                 <div style={{ width: '100%', height: '50%', display: 'flex', flexDirection: 'row' }}>
//                     {renderMedia(media[0], 0)}
//                     {renderMedia(media[1], 1)}
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '50%' }}>
//                     {renderMedia(media[2], 2)}
//                     {renderMedia(media[3], 3)}
//                 </div>
//             </div>
//         );
//     }

//     return null;

// };






// export const ImagesGrid = ({ tweet, images }) => {
//     const navigate = useNavigate();

//     let gridSize = [150, 300] // w&h
//     const handleImageNav = (tweet, index) => {
//         navigate(`/tweet/${tweet.id}/images/${index}`);
//     };

//     const renderMedia = (item, index) => {
//         const fileExtension = item.split('.').pop().toLowerCase();

//         if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
//             return (
//                 <img
//                     key={index}
//                     src={item}
//                     alt={`tweet media ${index + 1}`}
//                     className="grid-image"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         handleImageNav(tweet, index);
//                     }}
//                     style={{ objectFit: "cover", width: '100%', height: '100%' }}
//                 />
//             );
//         } else if (['mp4', 'webm'].includes(fileExtension)) {
//             return (
//                 <video
//                     key={index}
//                     controls
//                     className="grid-video"
//                     style={{ objectFit: "cover", width: '100%', height: '100%' }}
//                 >
//                     <source src={item} type={`video/${fileExtension}`} />
//                 </video>
//             );
//         } else {
//             return null;
//         }
//     };

//     const renderGrid = () => {
//         if (images.length === 1) {
//             return (
//                 <div id='images-grid' style={{ padding: "5%", justifyContent: 'center' }}>
//                     {renderMedia(images[0], 0)}
//                 </div>
//             );
//         }
//         if (images.length === 2) {
//             return (
//                 <div id='images-grid' style={{ padding: "5%", justifyContent: 'center' }}>
//                     <div style={{ width: `50%`, height: `100%` }}>
//                         {renderMedia(images[0], 0)}
//                     </div>
//                     <div style={{ width: `50%`, height: `100%` }}>
//                         {renderMedia(images[1], 1)}
//                     </div>
//                 </div>
//             );
//         } 
//         if (images.length === 3) {
//             return (
//                 <div id='images-grid' style={{ padding: "5%", display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
//                     <div style={{ width: `50%`, height: `100%` }}>
//                         {renderMedia(images[0], 0)}
//                     </div>
//                     <div style={{ display: 'flex', flexDirection: 'column', width: `50%`, height: `100%` }}>
//                         <div style={{ width: `100%`, height: `50%` }}>
//                             {renderMedia(images[1], 1)}
//                         </div>
//                         <div style={{ width: `100%`, height: `50%` }}>
//                             {renderMedia(images[2], 2)}
//                         </div>
//                     </div>
//                 </div>
//             );
//         } 
//         if (images.length === 4) {
//             return (
//                 <div id='images-grid' style={{ padding: "5%", display: 'flex', flexDirection: "column", justifyContent: 'center' }}>
//                     <div style={{ width: `100%`, height: `50%`, display: 'flex', flexDirection: 'row' }}>
//                         <div style={{ width: `50%`, height: `100%` }}>
//                             {renderMedia(images[0], 0)}
//                         </div>
//                         <div style={{ width: `50%`, height: `100%` }}>
//                             {renderMedia(images[1], 1)}
//                         </div>
//                     </div>
//                     <div style={{ width: `100%`, height: `50%`, display: 'flex', flexDirection: 'row' }}>
//                         <div style={{ width: `50%`, height: `100%` }}>
//                             {renderMedia(images[2], 2)}
//                         </div>
//                         <div style={{ width: `50%`, height: `100%` }}>
//                             {renderMedia(images[3], 3)}
//                         </div>
//                     </div>
//                 </div>
//             );
//         }
//     };

//     return renderGrid();
// };