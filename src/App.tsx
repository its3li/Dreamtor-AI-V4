import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageResults } from './components/ImageResults';
import { ImageViewer } from './components/ImageViewer';
import { GalleryPage } from './pages/GalleryPage';
import { generateImages, downloadImage } from './services/imageService';
import { ImageData, ImageSettings } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { saveImages, getStoredImages } from './utils/storage';

function App() {
  const [generatedImages, setGeneratedImages] = useState<ImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: 0.2
      }
    }
  };

  const handleGenerate = async (prompt: string, model: string, settings: Partial<ImageSettings>) => {
    try {
      setIsGenerating(true);
      setMessage('');
      
      const newImages = await generateImages(prompt, model, settings.imageCount || 2, settings);
      
      const imageDataArray = newImages.map(img => ({
        url: img.url,
        prompt: prompt,
        isEditing: false,
        isLoading: false,
        settings: img.settings
      }));
      
      setGeneratedImages(imageDataArray);

      // Save to gallery
      const currentGallery = getStoredImages();
      saveImages([...currentGallery, ...imageDataArray]);

      setMessage('Images generated successfully!');
    } catch (error) {
      setMessage('Error generating images. Please try again.');
      console.error('Error generating images:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImage(generatedImages[index].url);
    setIsModalOpen(true);
  };

  const handleEditImage = async (index: number, editPrompt: string) => {
    const imageToEdit = generatedImages[index];
    if (!imageToEdit) return;

    const updatedImages = [...generatedImages];
    updatedImages[index] = { ...imageToEdit, isLoading: true };
    setGeneratedImages(updatedImages);

    try {
      const newImage = await generateImages(editPrompt, 'balanced', 1, {
        seed: imageToEdit.settings?.seed
      });

      const editedImage = {
        url: newImage[0].url,
        prompt: editPrompt,
        isEditing: false,
        isLoading: false,
        settings: newImage[0].settings
      };

      updatedImages[index] = editedImage;
      setGeneratedImages(updatedImages);

      // Update the edited image in gallery
      const currentGallery = getStoredImages();
      const galleryIndex = currentGallery.findIndex(img => img.url === imageToEdit.url);
      if (galleryIndex !== -1) {
        currentGallery[galleryIndex] = editedImage;
        saveImages(currentGallery);
      }

    } catch (error) {
      console.error('Error editing image:', error);
      updatedImages[index] = { ...imageToEdit, isLoading: false };
      setGeneratedImages(updatedImages);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      await downloadImage(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async (url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my AI-generated image!',
          text: 'Created with Dreamator',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#0F0817]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.nav 
        variants={navVariants}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4"
      >
        <motion.div 
          className="nav-container w-full max-w-xs"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-pill flex-1 text-center ${isActive ? 'active' : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `nav-pill flex-1 text-center ${isActive ? 'active' : ''}`
            }
          >
            Gallery
          </NavLink>
        </motion.div>
      </motion.nav>
      
      <motion.header 
        className="relative container mx-auto px-4 pt-24 pb-6 text-center"
        variants={containerVariants}
      >
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl mb-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <span className="font-rockybilly tracking-wider">Dreamator</span>
          <span className="font-sans ml-2 text-gradient">AI</span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-base sm:text-lg text-white/80 mb-2"
        >
          Transform your imagination into reality
        </motion.p>
        
        <motion.p 
          variants={itemVariants}
          className="text-sm sm:text-base text-white/60 font-arabic"
        >
          حوّل خيالك إلى واقع
        </motion.p>
      </motion.header>

      <motion.main 
        className="relative container mx-auto px-4 py-6"
        variants={containerVariants}
      >
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <ImageGenerator
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    message={message}
                  />
                  <ImageResults
                    images={generatedImages}
                    onImageClick={handleImageClick}
                    onEditImage={handleEditImage}
                    downloadImage={handleDownload}
                    shareImage={handleShare}
                  />
                  {selectedImage && (
                    <ImageViewer
                      imageUrl={selectedImage}
                      isModalOpen={isModalOpen}
                      onModalClose={() => setIsModalOpen(false)}
                      onCopyLink={() => {}}
                      onShare={() => handleShare(selectedImage)}
                      prompt=""
                      onDownload={async () => {
                        if (selectedImage) {
                          await downloadImage(selectedImage);
                        }
                      }}
                    />
                  )}
                </motion.div>
              }
            />
            <Route 
              path="/gallery" 
              element={
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <GalleryPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </motion.main>
      <footer className="mt-auto py-8 text-center text-[#6c5ce7] dark:text-[#7a64e4] text-sm">
        <p className="mb-2">
          Built with ❤ by Ali Mahmoud using
          <span className="font-semibold"> React</span>,
          <span className="font-semibold"> Vite</span>,
          <span className="font-semibold"> Tailwind CSS</span>, and
          <span className="font-semibold"> Pollinations API</span>.
        </p>
        <p>All rights reserved • {new Date().getFullYear()} </p>
      </footer>
    </motion.div>
  );
}

export default App;
