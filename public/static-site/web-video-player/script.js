document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('custom-video');
    const urlInput = document.getElementById('url-input');
    const dropZone = document.getElementById('drop-zone');
    const dropText = document.getElementById('drop-text');
    const fileName = document.getElementById('file-name');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.style.display = 'none';

    function loadVideoFromUrl(url) {
        video.src = url;
        video.load();
    }

    function handleFileSelect(file) {
        if (file && file.type.startsWith('video/')) {
            const fileUrl = URL.createObjectURL(file);
            loadVideoFromUrl(fileUrl);
            displayFileName(file.name);
        } else {
            alert('Please select a valid video file.');
        }
    }

    function displayFileName(name) {
        fileName.textContent = name;
        dropText.style.display = 'none';
        fileName.style.display = 'block';
    }

    function resetDropZone() {
        dropText.style.display = 'block';
        fileName.style.display = 'none';
        fileName.textContent = '';
    }

    urlInput.addEventListener('change', () => {
        loadVideoFromUrl(urlInput.value);
        resetDropZone();
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = '#e9e9e9';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.backgroundColor = '';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = '';
        handleFileSelect(e.dataTransfer.files[0]);
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });

    // Player settings
    const playPauseBtn = document.querySelector('.play-pause-btn');
    const fullScreenBtn = document.querySelector('.full-player-btn');
    const videoContainer = document.querySelector('.video-container');
    const muteBtn = document.querySelector('.mute-btn');
    const speedBtn = document.querySelector('.speed-btn');
    const volumeSlider = document.querySelector('.volume-slider');
    const currentTimeElem = document.querySelector('.current-time');
    const totalTimeElem = document.querySelector('.total-time');
    const timelineContainer = document.querySelector('.timeline-container');
    let isScrubbing = false;
    let wasPaused;

    document.addEventListener('keydown', (e) =>{
        const tagName = document.activeElement.tagName.toLowerCase();

        if(tagName === 'input') return
        switch (e.key.toLowerCase()) {
            case ' ' :
                if(tagName === 'button') return
            case 'k' :
                togglePlay()
                break
            case 'f':
                toggleFullScreenMode()
            case 'm':
                toggleMute()
                break
            case 'arrowleft':
            case 'j':
                skip(-5)
                break
            case 'arrowright':
            case 'l':
                skip(5)
                break
        }
    })

    //Timeline
    timelineContainer.addEventListener('mousemove', handleTimelineUpdate);
    timelineContainer.addEventListener('mousedown', toggleScrubbing);
    document.addEventListener('mouseup', e => {
        if(isScrubbing) toggleScrubbing(e);
    })

    document.addEventListener('mousemove', e => {
        if(isScrubbing) handleTimelineUpdate(e);
    })

    function toggleScrubbing(e) {
        const rect = timelineContainer.getBoundingClientRect();
        const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
        isScrubbing = (e.buttons & 1) === 1;
        videoContainer.classList.toggle('scrubbing', isScrubbing);

        if(isScrubbing) {
            wasPaused = video.paused;
            video.pause();
        } else{
            video.currentTime = percent * video.duration
            if(!wasPaused) video.play()
        }

        handleTimelineUpdate(e)
    }

    function handleTimelineUpdate(e) {
        const rect = timelineContainer.getBoundingClientRect();
        const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
        timelineContainer.style.setProperty("--preview-position", percent);

        if(isScrubbing) {
            e.preventDefault();
            timelineContainer.style.setProperty("--progress-position", percent);
        }
    }

    //Playback speed
    speedBtn.addEventListener('click', changePlaybackSpeed);

    function changePlaybackSpeed() {
        let newPlaybackRate = video.playbackRate + .25
        if(newPlaybackRate > 2) newPlaybackRate = .25
        video.playbackRate = newPlaybackRate;
        speedBtn.textContent = `${newPlaybackRate}x`
    }

    //Duration
    video.addEventListener('loadeddata',() => {
        totalTimeElem.textContent = formatDuration(video.duration);
    })

    video.addEventListener('timeupdate', () => {
        currentTimeElem.textContent = formatDuration(video.currentTime);
        const percent = video.currentTime / video.duration;
        timelineContainer.style.setProperty("--progress-position", percent);
    })

    const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 2
    })

    function formatDuration(time) {
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor(time / 60) % 60;
        const hours = Math.floor(time / 3600);

        if(hours === 0) {
            return `${minutes}:${leadingZeroFormatter.format(seconds)}`
        } else {
            return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`
        }

    }

    function skip(duration) {
        video.currentTime += duration;
    }

    //Volume 
    muteBtn.addEventListener('click',toggleMute);
    volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
        video.muted = e.target.value === 0;
    })

    video.addEventListener('volumechange',() => {
        volumeSlider.volume = video.volume
        let volumeLevel;
        if(video.muted || video.volume === 0) {
            volumeLevel = 'muted'
        } else if(video.volume >= .5) {
            volumeLevel = 'high'
        } else {
            volumeLevel = 'low'
        }

        videoContainer.dataset.volumeLevel = volumeLevel;
    })

    function toggleMute() {
        video.muted = !video.muted;
    }

    fullScreenBtn.addEventListener('click',toggleFullScreenMode);

    function toggleFullScreenMode() {
        if(document.fullscreenElement == null) {
            videoContainer.requestFullscreen();
        }
        else{
            document.exitFullscreen();
        }
    }

    document.addEventListener('fullscreenchange', () => {
        videoContainer.classList.toggle('full-screen',document.fullscreenElement);
    })

    video.addEventListener('enterpictureinpicture', () => {
        videoContainer.classList.add('mini-player');
    })

    video.addEventListener('leavepictureinpicture', () => {
        videoContainer.classList.remove('mini-player');
    })

    // play/pause
    playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click',togglePlay)

    function togglePlay() {
        if(video.hasAttribute("src")) {
            video.paused ? video.play() : video.pause();
        }
    }

    video.addEventListener('play',() => {
        videoContainer.classList.remove('paused');
    })

    video.addEventListener('pause',() => {
        videoContainer.classList.add('paused');
    })

});