import { useState } from "react";
import img1 from "../assets/add.svg"
import img2 from "../assets/heart.svg"
import img3 from "../assets/home.svg"
import { Carousel } from "react-bootstrap";

export const CarouselView = () => {
    const [activeIndex, setActiveIndex] = useState();
    const handleSelect = (selected) => {
        setActiveIndex(selected)
    }
    return (
        <Carousel activeIndex={activeIndex} onSelect={handleSelect}>
       
            <Carousel.Item>
                <img src={img1} style={{width:'40px'}} />
            </Carousel.Item>
            <Carousel.Item>
                <img src={img2} style={{width:'40px'}} />
            </Carousel.Item>
            <Carousel.Item>
                <img src={img3} style={{width:'40px'}} />
            </Carousel.Item>
      </Carousel>
    )
};