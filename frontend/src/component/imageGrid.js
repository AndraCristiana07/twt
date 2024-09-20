import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";


export const ImagesGrid = ({ tweet, images }) => {
    const navigate = useNavigate();

    let gridSize = [150, 300] // w&h

    const handleImageNav = (tweet, index) => {
        navigate(`/tweet/${tweet.id}/images/${index}`);
    }


    if (images.length === 1) {
        return <div id='images-grid' style={{ padding: "5%", justifyContent: 'center' }}>
            <img key={0} src={images[0]} alt="tweet image" className="grid-image"
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
        </div>
    }
    if (images.length === 2) {
        return <div id='images-grid' style={{ padding: "5%", justifyContent: 'center' }}>
            <img key={0} src={images[0]} alt="tweet image" className="grid-image"
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
            <img key={1} src={images[1]} alt="tweet image" className="grid-image"
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
        </div>
    }
    if (images.length === 3) {
        return <div id='images-grid' style={{ padding: "5%", display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
            <div style={{
                width: `50%`,
                height: `100%`
            }}>
                <img key={0} src={images[0]} alt="tweet image" className="grid-image"
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
            </div>
            <div style={{
                display: 'flex', flexDirection: 'column',
                width: `50%`,
                height: `100%`
            }}>
                <img key={1} src={images[1]} alt="tweet image" className="grid-image"
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
                <img key={2} src={images[2]} alt="tweet image" className="grid-image"
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
            </div>
        </div>
    }
    if (images.length === 4) {
        return <div id='images-grid' style={{ padding: "5%", display: 'flex', flexDirection: "column", justifyContent: 'center' }}>
            <div style={{
                width: `100%`,
                height: `50%`,
                display: 'flex',
                flexDirection: 'row'
            }}>
                <img key={0} src={images[0]} alt="tweet image" className="grid-image"
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
                <img key={1} src={images[1]} alt="tweet image" className="grid-image"
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
            </div>
            <div style={{
                display: 'flex', flexDirection: 'row',
                width: `100%`,
                height: `50%`
            }}>
                <img key={2} src={images[2]} alt="tweet image" className="grid-image"
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
                <img key={3} src={images[3]} alt="tweet image" className="grid-image"
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
            </div>
        </div>
    }


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
}



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