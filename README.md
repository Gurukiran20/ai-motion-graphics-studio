# AI Motion Graphics Studio

**MG-Gen Inspired Motion Graphics Generation System**

## Overview

AI Motion Graphics Studio is an agentic workflow system inspired by the MG-Gen research paper.

Instead of directly generating videos, the system analyzes images, creates scene structures, plans motion, renders animations, evaluates quality, and allows iterative refinement through natural language feedback.

The project demonstrates how the core concepts of MG-Gen can be extended into a practical motion graphics generation platform.

---

## Application Screenshots

### Home Page

<img width="1886" height="917" alt="Screenshot 2026-06-17 153326" src="https://github.com/user-attachments/assets/4d015b40-6c4c-4219-b899-13dc8c5dc7ec" />


### Scene Understanding & Script Generation

<img width="1905" height="885" alt="Screenshot 2026-06-17 153347" src="https://github.com/user-attachments/assets/3bcc2d65-17da-4cfd-bd2a-cbfea8c05976" /> <br><br>

<img width="1878" height="933" alt="Screenshot 2026-06-17 153400" src="https://github.com/user-attachments/assets/fd95bdee-db23-482c-92ca-b57c0ffa34c0" />


### Motion Planning


<img width="1878" height="933" alt="Screenshot 2026-06-17 153400" src="https://github.com/user-attachments/assets/ac3685b2-a7f7-43f1-9a30-eab9165e125a" />

### Video Generation Pipeline

<img width="1892" height="901" alt="Screenshot 2026-06-17 153503" src="https://github.com/user-attachments/assets/88eeda19-7913-4a7c-ad48-33e4be08418f" />


### Self Evaluation

<img width="1890" height="921" alt="Screenshot 2026-06-17 153543" src="https://github.com/user-attachments/assets/3592a3d9-5c60-4e75-99f1-1d667ad91d66" />


### Final Generated Video

<img width="1470" height="701" alt="Screenshot 2026-06-18 110834" src="https://github.com/user-attachments/assets/4109ce38-f670-45e9-821d-8a5ff7844dbe" />


---

## Features

### Scene Understanding

* Upload marketing creatives, posters, flyers, or product images
* Extract scene structure
* Detect visual hierarchy
* Create structured scene representation

### Script Generation

* Generate scene-by-scene animation scripts
* Break content into multiple animation scenes

### Frame Generation

* Generate scene frames
* Create start and end states for animation

### Motion Planning

* Plan motion for each scene
* Headline animations
* Product animations
* CTA animations
* Background transitions

### Motion Rendering

* Generate motion graphics videos
* Scene chaining workflow
* Smooth scene transitions

### Self Evaluation

* Evaluate generated outputs
* Check readability
* Check motion quality
* Check scene consistency

### Feedback-To-Fix

* Accept natural language feedback
* Update animation plans automatically
* Regenerate outputs with improvements

### Export

* MP4 Export
* Multiple aspect ratio support

---

## MG-Gen Inspired Workflow

```text
Upload Image
    ↓
Scene Understanding Agent
    ↓
Script Generation Agent
    ↓
Frame Generation Agent
    ↓
Motion Planning Agent
    ↓
Motion Rendering Agent
    ↓
Self Evaluation Agent
    ↓
Feedback-To-Fix Agent
    ↓
Final Video Output
```

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* SQLite

### AI Layer

* Z.AI Agent SDK
* Agent-Based Workflow Architecture

### Video Processing

* FFmpeg

### Motion System

* Scene Chaining
* Motion Planning
* Frame-Based Animation Workflow

---

## Architecture

### Agent 1 — Scene Understanding

Extracts:

* Headline
* Subheadline
* CTA
* Product Elements
* Layout Structure

### Agent 2 — Script Generation

Creates:

* Scene Breakdown
* Story Flow
* Animation Sequence

### Agent 3 — Frame Generation

Creates:

* Scene Start Frame
* Scene End Frame

### Agent 4 — Motion Planning

Plans:

* Camera Motion
* Element Motion
* Scene Transitions

### Agent 5 — Rendering

Generates:

* Motion Graphics Video

### Agent 6 — Self Evaluation

Reviews:

* Readability
* Motion Quality
* Visual Consistency

### Agent 7 — Feedback-To-Fix

Applies:

* User Corrections
* Motion Adjustments
* Layout Updates

---

## Acknowledgements

 Special thanks 🙏 to **Chirag Agrawal**, Founder of Fluexy, for providing valuable guidance, feedback, and direction throughout the development of this project.

His insights on understanding the core logic of the MG-Gen research paper, scene-based motion generation, agentic workflows, motion planning, and overall product thinking helped shape the implementation and improve the final solution.

I sincerely appreciate the opportunity to work on this challenging and exciting assignment.
