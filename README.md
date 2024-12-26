Winmix Prediction System - Project Overview
Project Goal
The aim of this project is to create a sports betting prediction system that provides accurate forecasts for football matches using statistical data, machine learning, and user feedback. The system is designed to present predictions, statistics, and other relevant information in a transparent and informative manner to users.

Current Status
The project is under development. The following key components have been completed so far:

Backend:
The foundations of the backend built on Node.js (Express) are complete. API endpoints for data retrieval, storage, and updates have been implemented. The /matches and /settings routes are functional.

Frontend:
The frontend foundations have been set up using React, integrated with Next.js, Tailwind CSS, and Shadcn/ui. Most UI components have been developed based on Figma designs, but the overall design is not finalized. Work on the /stats and /login routes is in progress.

Machine Learning:
A Python environment has been set up, and data preprocessing has begun. Initial tests with logistic and linear regression models have been conducted. Communication between the backend and Python models via API has been implemented.

Priorities
Finalizing the integration of machine learning models (Python).
Implementing frontend pages (statistics, settings, predictions) and missing components.
Developing user login and permission management.
Completing the manual result recording functionality.
Testing and debugging.
Technological Background
Backend: Node.js, Express, MySQL
Frontend: React, Next.js, Tailwind CSS, Shadcn/ui
Machine Learning: Python (scikit-learn, TensorFlow/PyTorch)
Database: MySQL
API Communication: REST API, JSON
Version Control: Git, GitHub
Resources
GitHub Repository: https://github.com/Winmix713/nartinko
Figma: [Link to Figma file]
API Documentation: TXT file describing combined_matches_api.php, combined_matches.json
Pending Tasks
Backend:

Completing communication with machine learning models.
Refining the prediction logic.
Implementing dynamic handling of weighting parameters.
Adding a feedback mechanism.
Developing user management and permission control.
Finalizing the manual result recording functionality.
Creating the /api/predict endpoint to call the Python API for weighting and predictions.
Frontend:

Implementing missing pages and components (statistics page, dashboard).
Finalizing the design and layout.
Improving the display of responses from machine learning models.
Making the user interface responsive.
Integrating the login system.
Conducting testing and debugging.
Machine Learning:

Further analysis and preprocessing of data.
Training, testing, and fine-tuning machine learning models.
Introducing additional models (e.g., neural networks, ensemble learning).
Integrating models with the backend API.
Implementing communication through the Python API.
Gaps
The document is not yet complete and needs continuous updates.
Design and layout finalization on the frontend is pending.
The Figma link and combined_matches.json file are missing from the repository.
The demo page has not been created.
Data validation has not been implemented.
Weighting parameter changes do not yet send requests to the backend, and the POST request to the /settings endpoint is incomplete.
The /api/predict route is not connected to the Python model.
