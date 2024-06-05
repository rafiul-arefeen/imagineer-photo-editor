import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
// import 'cropperjs/dist/cropper.css';
import saveImage from '../Functions/SaveImage';
import "../assets/css/PhotoEditor.css";

const PhotoEditor = () => {
    const [activePanel, setActivePanel] = useState('general');
    const [brightness, setBrightness] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [inversion, setInversion] = useState(0);
    const [grayscale, setGrayscale] = useState(0);
    const [contrast, setContrast] = useState(100);
    const [blur, setBlur] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [rotate, setRotate] = useState(0);
    const [flipHorizontal, setFlipHorizontal] = useState(1);
    const [flipVertical, setFlipVertical] = useState(1);
    const [cropper, setCropper] = useState(null);
    const [chatInput, setChatInput] = useState('');

    const previewImgRef = useRef(null);
    const fileInputRef = useRef(null);

    const loadImage = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const previewImg = previewImgRef.current;
        previewImg.src = URL.createObjectURL(file);
        previewImg.onload = () => {
            resetFilter();
            document.querySelector(".container").classList.remove("disable");
        };
    };

    const applyFilter = () => {
        const previewImg = previewImgRef.current;
        previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
        previewImg.style.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
            invert(${inversion}%)
            grayscale(${grayscale}%)
            blur(${blur}px)
            sepia(${sepia}%)
        `;
    };

    useEffect(() => {
        applyFilter();
    }, [brightness, saturation, inversion, grayscale, contrast, blur, sepia, rotate, flipHorizontal, flipVertical]);

    const resetFilter = () => {
        if (cropper) {
            cropper.destroy();
            setCropper(null);
        }
        setBrightness(100);
        setSaturation(100);
        setInversion(0);
        setGrayscale(0);
        setContrast(100);
        setBlur(0);
        setSepia(0);
        setRotate(0);
        setFlipHorizontal(1);
        setFlipVertical(1);
    };

    const handleCrop = () => {
        if (cropper) {
            cropper.destroy();
            setCropper(null);
        } else {
            const previewImg = previewImgRef.current;
            const newCropper = new Cropper(previewImg, {
                aspectRatio: 0,
                viewMode: 2,
                rotatable: true,
            });
            setCropper(newCropper);
        }
    };

    const dataURLToBlob = (dataURL) => {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    };

    const sendToBackend = async (blob, chatInput) => {
        const formData = new FormData();
        if (blob) {
            formData.append('image', blob);
        }
        formData.append('chatInput', chatInput);

        try {
            const response = await fetch('/upload-endpoint', {  // Replace with your backend URL
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Data uploaded successfully:', result);
            } else {
                console.error('Data upload failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error uploading data:', error);
        }
    };

    const cropImage = () => {
        if (cropper) {
            cropper.crop();
            const croppedCanvas = cropper.getCroppedCanvas();
            const previewImg = previewImgRef.current;
            const dataURL = croppedCanvas.toDataURL();
            previewImg.src = dataURL;

            const blob = dataURLToBlob(dataURL);
            sendToBackend(blob, chatInput);

            cropper.destroy();
            setCropper(null);
        }
    };

    return (
        <div className="container disable">
            <h2>Imagineer | Photo Editor with AI</h2>
            <div className="wrapper">
                <div className="editor-container">
                    <div className="top-row">
                        <button className={`general-panel ${activePanel === 'general' ? 'active' : ''}`} onClick={() => setActivePanel('general')}>General</button>
                        <button className={`ai-panel ${activePanel === 'ai' ? 'active' : ''}`} onClick={() => setActivePanel('ai')}>AI</button>
                    </div>
                    <div className="editor-panel">
                        <div className="editor-panel-content">
                            {activePanel === 'general' && (
                                <>
                                    <div className="crop">
                                        <label className="title">Crop</label>
                                        <div className="options">
                                            <button id="cropButton" onClick={handleCrop}><i className="fa-solid fa-crop"></i></button>
                                            <button id="confirmCropButton" onClick={cropImage} disabled={!cropper}>Crop</button>
                                        </div>
                                    </div>
                                    <div className="filter">
                                        <label className="title">Filters</label>
                                        <div className="slider">
                                            <label>Brightness</label>
                                            <input type="range" value={brightness} min="0" max="200" onChange={(e) => setBrightness(e.target.value)} />
                                            <label>Contrast</label>
                                            <input type="range" value={contrast} min="0" max="200" onChange={(e) => setContrast(e.target.value)} />
                                            <label>Saturation</label>
                                            <input type="range" value={saturation} min="0" max="200" onChange={(e) => setSaturation(e.target.value)} />
                                            <label>Inversion</label>
                                            <input type="range" value={inversion} min="0" max="100" onChange={(e) => setInversion(e.target.value)} />
                                            <label>Grayscale</label>
                                            <input type="range" value={grayscale} min="0" max="100" onChange={(e) => setGrayscale(e.target.value)} />
                                            <label>Blur</label>
                                            <input type="range" value={blur} min="0" max="10" onChange={(e) => setBlur(e.target.value)} />
                                            <label>Sepia</label>
                                            <input type="range" value={sepia} min="0" max="100" onChange={(e) => setSepia(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="rotate">
                                        <label className="title">Rotate & Flip</label>
                                        <div className="options">
                                            <button onClick={() => setRotate(rotate - 90)}>Rotate Left</button>
                                            <button onClick={() => setRotate(rotate + 90)}>Rotate Right</button>
                                            <button onClick={() => setFlipHorizontal(flipHorizontal === 1 ? -1 : 1)}>Flip Horizontal</button>
                                            <button onClick={() => setFlipVertical(flipVertical === 1 ? -1 : 1)}>Flip Vertical</button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {activePanel === 'ai' && (
                                <>
                                    <div className="chatbox">
                                        <textarea 
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Enter your text here..."
                                        />
                                        <button onClick={() => sen23dToBackend(null, chatInput)}>Send Chat</button>
                                    </div>
                                    <button className="masking-button" onClick={() => setActivePanel('masking')}>Masking</button>
                                    <button className="style-transfer-button" onClick={() => setActivePanel('styleTransfer')}>Style Transfer</button>
                                </>
                            )}
                            {activePanel === 'masking' && <div className="masking-panel">Masking Content</div>}
                            {activePanel === 'styleTransfer' && <div className="style-transfer-panel">Style Transfer Content</div>}
                        </div>
                    </div>
                    <div className="controls">
                        <button className="reset-filter" onClick={resetFilter}>Reset</button>
                        <button className="choose-img" onClick={() => fileInputRef.current.click()}>Choose Image</button>
                        <button className="save-img" onClick={saveImage}>Save Image</button>
                        <input type="file" className="file-input" ref={fileInputRef} style={{ display: 'none' }} onChange={loadImage} />
                    </div>
                </div>
                <div className="preview-img">
                    <img ref={previewImgRef} alt="Preview" />
                </div>
            </div>
        </div>
    );
};

export default PhotoEditor;
