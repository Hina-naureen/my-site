---
sidebar_position: 99
title: "References & Further Reading"
description: "Key papers, books, courses, documentation, and tools for Physical AI and Humanoid Robotics."
---

# References & Further Reading

Organised by module. All links were valid as of early 2025.

---

## Module 1 — Foundations

### Papers
- Brooks, R. (1991). *Intelligence without representation*. Artificial Intelligence, 47(1–3), 139–159.
- Pfeifer, R., & Scheier, C. (1999). *Understanding Intelligence*. MIT Press.
- Cheng, G., et al. (2019). *Musculoskeletal Humanoid Robot — Design and Applications*. IEEE RAM.

### Books
- **Modern Robotics** — Lynch & Park (2017). Cambridge University Press. [Free PDF available](https://modernrobotics.northwestern.edu/)
- **Robotics: Modelling, Planning and Control** — Siciliano et al. (2009). Springer.
- **Probabilistic Robotics** — Thrun, Burgard & Fox (2005). MIT Press.

### Courses
- [MIT 6.832 — Underactuated Robotics](https://underactuated.csail.mit.edu/) (Russ Tedrake, free online)
- [ETH Zurich — Robotics (edX)](https://www.edx.org/learn/robotics)

---

## Module 2 — ROS 2

### Documentation
- [ROS 2 Humble Hawksbill Documentation](https://docs.ros.org/en/humble/)
- [Nav2 Documentation](https://docs.nav2.org/)
- [ros2_control Documentation](https://control.ros.org/)

### Papers
- Macenski, S., et al. (2022). *Robot Operating System 2: Design, Architecture, and Uses in the Wild*. Science Robotics.
- Macenski, S., et al. (2020). *The Marathon 2: A Navigation System*. IROS.

### Books
- **A Gentle Introduction to ROS** — Jason M. O'Kane (2014). [Free PDF](https://www.cse.sc.edu/~jokane/agitr/)

### Courses
- [ROS 2 for Beginners — The Robotics Back-End](https://roboticsbackend.com/ros2-tutorials/)
- [Nav2 Getting Started Tutorial](https://docs.nav2.org/getting_started/index.html)

---

## Module 3 — Simulation

### Documentation
- [Gazebo Harmonic Documentation](https://gazebosim.org/docs/harmonic)
- [Unity Robotics Hub — GitHub](https://github.com/Unity-Technologies/Unity-Robotics-Hub)
- [URDF Tutorials (ROS Wiki)](http://wiki.ros.org/urdf/Tutorials)

### Papers
- Koenig, N., & Howard, A. (2004). *Design and Use Paradigms for Gazebo, An Open-Source Multi-Robot Simulator*. IROS.
- Todorov, E., et al. (2012). *MuJoCo: A Physics Engine for Model-Based Control*. IROS.

### Tools
- **Blender** — Free 3D modeling for URDF mesh creation. [blender.org](https://www.blender.org)
- **Phobos** — Blender add-on for robot model creation. [GitHub](https://github.com/dfki-ric/phobos)
- **xacro** — XML macro language for modular URDF. [ROS Wiki](http://wiki.ros.org/xacro)

---

## Module 4 — NVIDIA Isaac

### Documentation
- [Isaac Sim Documentation](https://docs.isaacsim.omniverse.nvidia.com/)
- [Isaac ROS Documentation](https://nvidia-isaac-ros.github.io/)
- [Isaac ROS Visual SLAM](https://nvidia-isaac-ros.github.io/repositories_and_packages/isaac_ros_visual_slam/)
- [Replicator API Reference](https://docs.omniverse.nvidia.com/py/replicator/)

### Papers
- Müller, M., et al. (2021). *Real-to-Sim-to-Real: Leveraging Simulation for Robotics Tasks with Scarce Real Data*. ICRA.
- Tobin, J., et al. (2017). *Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World*. IROS.

### Datasets
- [Objaverse](https://objaverse.allenai.org/) — 800k+ 3D objects for synthetic scenes.
- [NVIDIA's SimReady Assets](https://catalog.ngc.nvidia.com/) — Physically accurate 3D assets for Isaac Sim.

---

## Module 5 — VLA & AI

### Papers

#### VLA Models
- Black, K., et al. (2024). *π0: A Vision-Language-Action Flow Model for General Robot Control*. Physical Intelligence. [arXiv:2410.24164](https://arxiv.org/abs/2410.24164)
- Brohan, A., et al. (2023). *RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control*. CoRL. [arXiv:2307.15818](https://arxiv.org/abs/2307.15818)
- Kim, M.J., et al. (2024). *OpenVLA: An Open-Source Vision-Language-Action Model*. [arXiv:2406.09246](https://arxiv.org/abs/2406.09246)
- Ghosh, D., et al. (2024). *Octo: An Open-Source Generalist Robot Policy*. [arXiv:2405.12213](https://arxiv.org/abs/2405.12213)
- Chi, C., et al. (2023). *Diffusion Policy: Visuomotor Policy Learning via Action Diffusion*. RSS. [arXiv:2303.04137](https://arxiv.org/abs/2303.04137)

#### Speech & Language
- Radford, A., et al. (2022). *Robust Speech Recognition via Large-Scale Weak Supervision* (Whisper). [arXiv:2212.04356](https://arxiv.org/abs/2212.04356)
- Wei, J., et al. (2022). *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*. NeurIPS.

#### LLM Robot Planning
- Ahn, M., et al. (2022). *Do As I Can, Not As I Say: Grounding Language in Robotic Affordances* (SayCan). [arXiv:2204.01691](https://arxiv.org/abs/2204.01691)
- Liang, J., et al. (2023). *Code as Policies: Language Model Programs for Embodied Control*. ICRA. [arXiv:2209.07753](https://arxiv.org/abs/2209.07753)

### Datasets
- [Open X-Embodiment](https://robotics-transformer-x.github.io/) — 970k robot episodes across 22 robot types.
- [BridgeData V2](https://rail-berkeley.github.io/bridgedata/) — 60k robot manipulation demonstrations.
- [DROID](https://droid-dataset.github.io/) — 76k episodes across diverse environments.

### Models & Tools
- [OpenVLA Weights (HuggingFace)](https://huggingface.co/openvla/openvla-7b)
- [Whisper (GitHub)](https://github.com/openai/whisper)
- [faster-whisper (GitHub)](https://github.com/SYSTRAN/faster-whisper)
- [Ollama](https://ollama.com/) — Local LLM inference server.
- [LangChain Documentation](https://python.langchain.com/)

---

## Module 6 — Capstone

### Reference Implementations
- [Nav2 Simple Commander](https://docs.nav2.org/commander_api/index.html) — Python API for Nav2.
- [ros2_control Demos](https://github.com/ros-controls/ros2_control_demos)
- [Isaac ROS Common](https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_common)

### Humanoid Robot Platforms
| Platform | Manufacturer | DOF | Notes |
|----------|-------------|-----|-------|
| H1 | Unitree Robotics | 19 | Open SDK, ROS 2 support |
| G1 | Unitree Robotics | 23 | Lighter, more affordable |
| Digit | Agility Robotics | 16 | Warehouse-focused |
| Atlas | Boston Dynamics | 28 | Research, not commercial |
| Optimus | Tesla | 28 | Not commercially available |
| 1X EVE | 1X Technologies | 22 | ROS 2 native |

---

## General Robotics Resources

### Books
- **Springer Handbook of Robotics** — Siciliano & Khatib (eds., 2016). The definitive reference.
- **Deep Learning for Robot Perception and Cognition** — Pajarinen et al. (2022). Academic Press.

### Communities
- [Robotics Stack Exchange](https://robotics.stackexchange.com/) — Q&A for robotics questions
- [ROS Discourse](https://discourse.ros.org/) — Official ROS community forum
- [r/robotics](https://www.reddit.com/r/robotics/) — General robotics discussion
- [Hugging Face LeRobot](https://huggingface.co/lerobot) — Open-source robot learning models and datasets

### Conferences
| Conference | Focus | Typical Venue |
|-----------|-------|--------------|
| ICRA | General robotics | May, varies |
| IROS | Intelligent robots | Oct, varies |
| RSS | Robotics science | Jun/Jul, varies |
| CoRL | Robot learning | Nov, varies |
| NeurIPS | ML/AI (inc. robotics) | Dec, varies |

---

:::tip Staying Current
The Physical AI field moves fast. Follow these resources for the latest:
- [Arxiv cs.RO](https://arxiv.org/list/cs.RO/recent) — Daily robotics preprints
- [Papers With Code — Robotics](https://paperswithcode.com/area/robotics) — State-of-the-art benchmarks
- [The Robot Report](https://www.therobotreport.com/) — Industry news
:::
