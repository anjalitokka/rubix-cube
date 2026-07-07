CubeVision – Computer Vision-Based Rubik's Cube Solver

CubeVision is a cross-platform mobile application that solves a Rubik's Cube by combining computer vision with an efficient solving algorithm. Users can scan all six faces of a cube using their device camera, review and correct detected colors if necessary, and receive a step-by-step solution to solve the cube.

The application also includes a built-in speedcubing timer with inspection mode, solve statistics, and device-specific history.

Demo:   https://rubix-cube-anjalitokkas-projects.vercel.app/

Features

📷 Scan all six faces of a Rubik's Cube using the camera.

🎨 Review and manually correct detected sticker colors.

🧩 Validate cube configurations before solving.

⚡ Generate optimal solving sequences using the Kociemba algorithm.

▶️ Interactive move-by-move solution viewer with playback controls.

⏱️ Integrated speedcubing timer with:

   15-second inspection | Best time | Average of 5 (Ao5) | Solve counter

💾 Device-specific timer and solve history using AsyncStorage.

📱 Responsive mobile interface with haptic feedback and camera integration.


Tech Stack

Frontend

   React Native | Expo | Expo Router | JavaScript

Backend

   Node.js | Express.js | REST APIs 
   
Database     
   
   MongoDB
   
Libraries & Tools

  OpenCV (Color Detection) | Kociemba Algorithm | AsyncStorage | Expo Camera | Expo Haptics
