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
        blur(${blur}px)
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
