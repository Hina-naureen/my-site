---
sidebar_position: 1
title: "Start Here"
description: "How to use this textbook, learning tracks, and the editorial style guide."
---

# Start Here

Welcome to **Physical AI & Humanoid Robotics** — an AI-native textbook for engineers, researchers, and students who want to build robots that perceive, reason, and act in the real world.

This is not a survey course. Each module is hands-on, culminating in a **capstone project**: a fully autonomous humanoid robot demo that integrates every layer of the stack.

---

## How This Textbook Is Organised

The content is arranged into **six progressive modules** plus a reference section:

| Module | Theme | Key Technologies |
|--------|-------|-----------------|
| 1 | Foundations | Physical AI, Sensors & Perception |
| 2 | ROS 2 | Nodes, Topics, Services, Nav2 |
| 3 | Simulation | Gazebo Harmonic, Unity Robotics Hub |
| 4 | NVIDIA Isaac | Isaac Sim, Synthetic Data, Visual SLAM |
| 5 | VLA & AI | VLA Models, Whisper ASR, LLM Planning |
| 6 | Capstone | Autonomous Humanoid Demo |

Each chapter follows the same template: **concepts → diagrams → code → summary → quiz → exercises**.

---

## Learning Tracks

Select the path that matches your background:

| Track | Background | Suggested Entry Point |
|-------|-----------|----------------------|
| **Beginner** | Python, no robotics | Start at Module 1 |
| **Intermediate** | ROS 1 or basic ROS 2 | Start at Module 2 |
| **Advanced** | ROS 2 + simulation | Jump to Module 4 or 5 |
| **Hackathon Sprint** | Any level | Critical path below |

:::tip Hackathon Critical Path
If you have 48–72 hours, follow this minimal path:
**Ch 1.1 → Module 2 → Ch 4.2 → Ch 5.1 → Ch 5.3 → Capstone**
:::

---

## Prerequisites

- **Programming:** Python 3.10+, basic C++ reading ability
- **OS:** Ubuntu 22.04 LTS (native or WSL2 on Windows)
- **Math:** Linear algebra, basic probability, calculus fundamentals
- **AI:** Familiarity with neural networks (required for Modules 4–5)

:::note Environment Setup
Before Module 2, verify your environment:
```bash
python3 --version     # expect 3.10+
ros2 --version        # expect Humble or Jazzy
gazebo --version      # expect Harmonic 8.x
```
:::

---

## Style Guide

This guide defines how every chapter in this textbook is written. Apply the same conventions to your own lab notes and project documentation.

### Admonitions

Admonitions are coloured callout boxes. Each type has a specific purpose:

| Type | Colour | Purpose |
|------|--------|---------|
| `:::note` | Blue | Background context, architecture facts |
| `:::tip` | Green | Practical shortcuts, best practices |
| `:::warning` | Yellow | Common mistakes, gotchas |
| `:::danger` | Red | Safety-critical steps, data loss risk |
| `:::info` | Teal | Optional deep-dives, related resources |

**Example:**

:::warning
Never modify files under `/opt/ros/`. Always install dependencies in your workspace's `install/` directory.
:::

### Mermaid Diagrams

Every architecture and pipeline is shown as a Mermaid diagram. Diagram types used in this textbook:

- `graph LR` / `graph TD` — system architectures and data flows
- `sequenceDiagram` — message-passing between ROS 2 nodes
- `classDiagram` — data structures and message types

Each diagram is followed by a **one-sentence caption** describing what it shows.

### Code Blocks

All code blocks carry a language tag:

| Tag | Used For |
|-----|----------|
| `python` | Python scripts and ROS 2 nodes |
| `bash` | Terminal commands |
| `yaml` | Config files, launch parameters |
| `xml` | URDF, SDF, launch XML |
| `json` | Structured data outputs |

### Chapter Template

Every content chapter uses this exact structure:

1. **Learning Objectives** — `:::note` admonition at the top
2. **Concept sections** — H2 headings, 3–5 per chapter
3. **At least one Mermaid diagram** — with caption
4. **Code examples** — runnable, minimal, annotated
5. **Chapter Summary** — `:::tip` admonition
6. **Knowledge Check** — 4–5 questions
7. **Exercises** — 3 hands-on tasks graded by difficulty

---

## Quick Navigation

| I want to… | Go to |
|------------|-------|
| See the full course outline | [Course Overview →](./course-overview) |
| Start learning fundamentals | [Physical AI Foundations →](./physical-ai-foundations) |
| Set up ROS 2 | [Introduction to ROS 2 →](./ros2-intro) |
| Build the capstone project | [Capstone →](./capstone-autonomous-humanoid) |
| Look up a term | [Glossary →](./glossary) |
| Find papers and tools | [References →](./references) |
