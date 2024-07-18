import { useState, useEffect} from "react";
import {Card} from "react-bootstrap";
export const StickyNote = () => {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    return (
        <Card className="card">
            <input placeholder="Title"/>
        </Card>
    )
}
