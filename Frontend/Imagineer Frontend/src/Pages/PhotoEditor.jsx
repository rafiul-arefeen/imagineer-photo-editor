import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import "../assets/css/PhotoEditor.css";
import 'boxicons/css/boxicons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const PhotoEditor = () => {
    const [activePanel, setActivePanel] = useState('general');
    const [activeSection, setActiveSection] = useState(null);
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
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [fileName, setFileName] = useState('');

    const previewImgRef = useRef(null);
    const fileInputRef = useRef(null);

    const loadImage = (event) => {
        const file = event.target.files[0];
        setFileName(file.name);
        // console.log(file.name);
        if (!file) return;
        const previewImg = previewImgRef.current;
        previewImg.src = URL.createObjectURL(file);
        previewImg.onload = () => {
            resetFilter();
            document.querySelector(".container").classList.remove("disable");
        };
    };

    // console.log("Hello" + fileName);

    const saveImage = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const previewImg = previewImgRef.current;
    
        let canvasWidth = previewImg.naturalWidth;
        let canvasHeight = previewImg.naturalHeight;
        if (rotate % 180 !== 0) {
            [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
        }
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    
        ctx.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
            invert(${inversion}%)
            grayscale(${grayscale}%)
            sepia(${sepia}%)
        `;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        if (rotate !== 0) {
            ctx.rotate(rotate * Math.PI / 180);
        }
        ctx.scale(flipHorizontal, flipVertical);
    
        const offsetX = -previewImg.naturalWidth / 2;
        const offsetY = -previewImg.naturalHeight / 2;
        ctx.drawImage(previewImg, offsetX, offsetY);
    
        const link = document.createElement('a');
        link.download = 'image.jpg';
        link.href = canvas.toDataURL();
        link.click();
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
        const BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) === -1) {
            const parts = dataURL.split(',');
            const contentType = parts[0].split(':')[1];
            const raw = decodeURIComponent(parts[1]);
            return new Blob([raw], { type: contentType });
        }
    
        const parts = dataURL.split(BASE64_MARKER);
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
    
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        return new Blob([uInt8Array], { type: contentType });
    };

    const sendToBackend = async (blob, chatInput, endpoint) => {
        const formData = new FormData();
        if (blob) {
            formData.append('image', blob);
        }
        formData.append('prompt', chatInput);

        for (const entry of formData.entries()) {
            const [key, value] = entry;
            console.log(`${key}: ${value}`);
        }
        console.log(`Endpoint: ${endpoint}`);
        
    
        try {
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData

                
            });
            
            

            if (response.ok) {
                const result = await response.json();
                setGeneratedImageUrl(result.url);
                console.log('Data uploaded successfully:', result);
            } else {
                console.error('Data upload failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error uploading data:', error);
        }
    };
    
    const sendChatToBackend = async (chatInput) => {
        let endpoint;
        let blob = null;
    
        switch (activeSection) {
            case 'generatingImage':
                console.log("Doing generatingImage");
                endpoint = 'http://localhost:5000/generate-image-from-text';
                break;
            case 'imageInpainting':
                console.log("Doing imageInpainting");
                endpoint = 'http://localhost:5000/image-inpainting-endpoint'; // Replace with your actual endpoint
                blob = fileName;
                break;
            case 'styleVariation':
                console.log("Doing styleVariation");
                endpoint = 'http://localhost:5000/style-variation-endpoint'; // Replace with your actual endpoint
                blob = fileName;
                break;
            case 'objectRemoval':
                console.log("Doing objectRemoval");
                endpoint = 'http://localhost:5000/object-removal-endpoint'; // Replace with your actual endpoint
                blob = fileName;
                break;
            default:
                return;
        }
    
        if (activeSection === 'generatingImage') {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt: chatInput })
                });
    
                if (response.ok) {
                    const result = await response.json();
                    setGeneratedImageUrl(result.url);
                    console.log('Image processed successfully:', result);
                } else {
                    console.error('Image processing failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error processing image:', error);
            }
        } else {
            await sendToBackend(blob, chatInput, endpoint);
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
                                            <button onClick={() => setRotate(rotate - 90)}>L</button>
                                            <button onClick={() => setRotate(rotate + 90)}>R</button>
                                            <button onClick={() => setFlipHorizontal(flipHorizontal === 1 ? -1 : 1)}>H</button>
                                            <button onClick={() => setFlipVertical(flipVertical === 1 ? -1 : 1)}>V</button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {activePanel === 'ai' && (
                                <>
                                    <div className="ai-options">
                                        <button onClick={() => setActiveSection('generatingImage')}>Generating Image</button>
                                        <button onClick={() => setActiveSection('styleVariation')}>Style Variation</button>
                                        <button onClick={() => setActiveSection('objectRemoval')}>Object Removal</button>
                                    </div>
                                    {activeSection && (
                                        <div className="chatbox">
                                            <textarea 
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Enter your text here..."
                                            />
                                            <button onClick={() => sendChatToBackend(chatInput)}>Send Chat</button>
                                        </div>
                                    )}
                                </>
                            )}
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
                {generatedImageUrl && (
                    <div className="generated-image">
                        <h3>Generated Image:</h3>
                        <img src={generatedImageUrl} alt="Generated" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoEditor;
