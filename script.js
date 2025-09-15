const voteBtn = document.getElementById('voteBtn');
const votePopup = document.getElementById('votePopup');
const closeBtn = document.getElementById('closePopup');
const minimizeBtn = document.getElementById('minimizePopup');
const reopenBtn = document.getElementById('reopenPopup');

// Helper to hide with animation
function hidePopup(callback) {
    votePopup.classList.remove('animate-in');
    votePopup.classList.add('animate-out');

    // Wait for animation to finish, then hide
    setTimeout(() => {
        votePopup.classList.add('hidden');
        votePopup.classList.remove('animate-out');
        if (callback) callback();
    }, 220); // match exit duration

}

voteBtn.addEventListener('click', () => {
    votePopup.classList.remove('hidden');
    votePopup.classList.add('animate-in');
    voteBtn.classList.add('hidden');
    reopenBtn.classList.add('hidden');
});

closeBtn.addEventListener('click', () => {
    hidePopup(() => {
        voteBtn.classList.remove('hidden');
        reopenBtn.classList.add('hidden');
    });
});

minimizeBtn.addEventListener('click', () => {
    hidePopup(() => {
        reopenBtn.classList.remove('hidden');
        voteBtn.classList.add('hidden');
    });
});

reopenBtn.addEventListener('click', () => {
    votePopup.classList.remove('hidden');
    votePopup.classList.add('animate-in');
    reopenBtn.classList.add('hidden');
    voteBtn.classList.add('hidden');
});

// ---------------------------------------------------------
// Auto-generate posters (thumbnails) for videos in .video-card
// This block is self-contained and does not modify your popup logic above.
// ---------------------------------------------------------
(() => {
    const run = () => {
        const videos = document.querySelectorAll('.video-card video');

        videos.forEach((video) => {
            // Skip if a poster already exists
            if (video.hasAttribute('poster')) return;

            const originalPreload = video.getAttribute('preload') || '';
            const restorePreload = () => {
                if (originalPreload) {
                    video.setAttribute('preload', originalPreload);
                } else {
                    video.removeAttribute('preload');
                }
            };

            const makePoster = async () => {
                try {
                    // Ensure minimal fetch to allow grabbing one frame
                    video.pause();
                    video.setAttribute('preload', 'metadata');
                    video.load();

                    // Wait for metadata (duration, dimensions)
                    await new Promise((resolve) => {
                        if (video.readyState >= 1) return resolve();
                        video.addEventListener('loadedmetadata', resolve, { once: true });
                    });

                    // Choose a target time: ~10% into the video, clamped to 0.5–2s
                    const duration = Number.isFinite(video.duration) ? video.duration : 10;
                    const targetTime = Math.min(Math.max(duration * 0.1, 0.5), 2);

                    // Seek to target frame
                    await new Promise((resolve, reject) => {
                        const onSeeked = () => {
                            video.removeEventListener('seeked', onSeeked);
                            resolve();
                        };
                        const onError = (e) => {
                            video.removeEventListener('error', onError);
                            reject(e);
                        };
                        video.addEventListener('seeked', onSeeked);
                        video.addEventListener('error', onError, { once: true });
                        // small timeout improves reliability in some browsers
                        setTimeout(() => {
                            try { video.currentTime = targetTime; } catch (e) { reject(e); }
                        }, 50);
                    });

                    // Draw frame to canvas (scaled to ~360px width for smaller data URL)
                    const vw = video.videoWidth || 360;
                    const vh = video.videoHeight || 640;
                    const maxW = 360;
                    const scale = Math.min(1, maxW / vw);
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(vw * scale);
                    canvas.height = Math.round(vh * scale);

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Convert to data URL and set as poster
                    const dataURL = canvas.toDataURL('image/jpeg', 0.78);
                    video.setAttribute('poster', dataURL);

                    // Reset playback position to the beginning so user playback starts at 0
                    if (video.currentTime !== 0) {
                        await new Promise((resolve) => {
                            const onSeekedBack = () => { video.removeEventListener('seeked', onSeekedBack); resolve(); };
                            video.addEventListener('seeked', onSeekedBack, { once: true });
                            try { video.currentTime = 0; } catch { resolve(); }
                        });
                    }
                    video.pause();
                } catch (err) {
                    console.warn('Thumbnail generation failed for:', video.currentSrc || video.src, err);
                } finally {
                    restorePreload();
                }
            };

            makePoster();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }
})();
