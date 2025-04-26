import React, { useState } from 'react';
import { Box, Typography, Modal } from '@mui/material';

function PhotosSection() {
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleOpen = (imgSrc) => {
        setSelectedImage(imgSrc);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedImage(null);
    };

    const fotos = ['/team.png', '/foto2.jpg']; // Reemplaza con tus rutas reales

    return (
        <Box mt={4}>
            
            <Box display="flex" flexDirection="column" gap={2}>
                {fotos.map((src, idx) => (
                    <img
                        key={idx}
                        src={src}
                        alt={`Foto ${idx + 1}`}
                        onClick={() => handleOpen(src)}
                        style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: '3px solid #2e7d32', // Verde ITJ, puedes usar #1976d2 para azul
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    />
                ))}
            </Box>

            {/* Modal para zoom */}
            <Modal open={open} onClose={handleClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                    component="img"
                    src={selectedImage}
                    alt="Imagen ampliada"
                    sx={{
                        maxWidth: '90%',
                        maxHeight: '90%',
                        borderRadius: 2,
                        boxShadow: 24,
                        border: '5px solid white',
                    }}
                />
            </Modal>
        </Box>
    );
}
export default PhotosSection;
