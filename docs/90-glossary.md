---
sidebar_position: 90
title: "Glossary"
description: "Definitions for all key terms used in Physical AI & Humanoid Robotics."
---

# Glossary

Definitions for terms used throughout this textbook, organised alphabetically.

---

## A

**Action (ROS 2)**
A long-running, cancellable communication interface in ROS 2. Actions have three parts: a Goal (sent by the client), Feedback (published by the server during execution), and a Result (returned on completion).

**Action Chunk**
In VLA models, a prediction of several future action steps at once (e.g., 50 ms worth of joint deltas), rather than predicting one step at a time. Reduces jitter and computation frequency.

**Actuator**
A device that converts a control signal (e.g., voltage, current, PWM) into physical motion. In humanoid robots: servo motors, brushless DC motors, hydraulic cylinders.

**Ament**
The build tool meta-system used in ROS 2. Replaces ROS 1 catkin. Includes `ament_cmake` (for C++) and `ament_python` (for Python packages).

**ASR (Automatic Speech Recognition)**
The task of converting spoken audio to text. In this textbook, performed by OpenAI Whisper.

---

## B

**Behaviour Tree (BT)**
A hierarchical control structure for robot decision-making. Nodes are either control nodes (Sequence, Fallback, Parallel) or execution nodes (Actions, Conditions). Nav2 uses BTs to orchestrate navigation and recovery.

**Bundle Adjustment (BA)**
A nonlinear optimisation step in SLAM that simultaneously refines camera poses and 3D landmark positions to minimise reprojection error.

---

## C

**Colcon**
The unified build tool for ROS 2 workspaces. Replaces `catkin_make` and `catkin build`. Core command: `colcon build --symlink-install`.

**Costmap**
A 2D grid representation of navigable space used by Nav2. Each cell holds a cost value: 0 (free), 253 (inflated), 254 (lethal obstacle), 255 (unknown). Maintained at two scales: global and local.

**CTranslate2**
A C++ inference engine for Transformer models (Whisper, BERT). Used by `faster-whisper` for optimised CPU/CUDA inference with INT8 quantisation.

---

## D

**DDS (Data Distribution Service)**
An OMG standard for publish-subscribe real-time messaging. The communication backbone of ROS 2, replacing the central `roscore` master from ROS 1. Implementations include FastDDS and CycloneDDS.

**Degrees of Freedom (DOF)**
The number of independent parameters that define the configuration of a mechanical system. A 7-DOF robot arm has 7 independent joint angles.

**Digital Twin**
A live, continuously-updated simulation of a physical system. In robotics, used for pre-flight trajectory validation, anomaly detection, and operator training.

**Domain Randomisation**
A simulation technique that randomises visual, physical, and sensor parameters during training so that a model learns robust features that generalise to the real world.

---

## E

**EKF (Extended Kalman Filter)**
A nonlinear state estimator that fuses multiple sensor streams (IMU, odometry, GPS) into a single pose estimate. The `robot_localization` ROS 2 package provides a drop-in EKF implementation.

**Embodied AI**
AI that perceives and acts through a physical body in a physical environment. Contrasted with "disembodied" AI that only processes data.

---

## F

**Faster-Whisper**
A CTranslate2-based reimplementation of OpenAI Whisper that is 2–4× faster with lower memory usage. Recommended for production robotics deployments.

**Flow Matching**
A generative modelling technique used in π0 to generate smooth, multi-modal action distributions. Learns to transform a simple noise distribution into a complex action distribution via a learned velocity field.

**Forward Kinematics (FK)**
The computation of end-effector pose from a given set of joint angles. The result is a 4×4 homogeneous transformation matrix.

---

## G

**Gazebo Harmonic**
The current generation (version 8.x) of the open-source Gazebo robot simulator. Uses the PhysX/DART physics engine and OGRE 2 renderer. Connected to ROS 2 via `ros_gz_bridge`.

---

## H

**Homogeneous Transformation Matrix**
A 4×4 matrix encoding a rigid-body transformation (3D rotation + translation). Used in forward kinematics to compose joint transformations.

---

## I

**IMU (Inertial Measurement Unit)**
A sensor combining a 3-axis accelerometer and 3-axis gyroscope (and optionally magnetometer) to measure linear acceleration and angular velocity.

**Isaac Perceptor**
NVIDIA's reference perception stack combining vSLAM, stereo depth, and 3D occupancy mapping (nvblox) into a production-ready pipeline for autonomous mobile robots.

**Isaac ROS**
A collection of NVIDIA-accelerated ROS 2 packages for perception workloads. Uses CUDA and TensorRT for GPU acceleration. Includes packages for vSLAM, stereo depth, object detection, and pose estimation.

**Isaac Sim**
NVIDIA's photorealistic, GPU-accelerated robotics simulator built on the Omniverse platform. Used for synthetic data generation and high-fidelity simulation.

**Inverse Kinematics (IK)**
The computation of joint angles required to achieve a desired end-effector pose. Generally underdetermined; solved numerically using tools like TRAC-IK or BioIK.

---

## J

**Joint (Robot)**
A degree of freedom connecting two robot links. Types: revolute (rotation), prismatic (translation), fixed (no motion), continuous (unlimited revolute).

---

## L

**LangChain**
A Python framework for building applications powered by LLMs. Provides abstractions for agents, tool-calling, memory, and retrieval-augmented generation.

**LiDAR (Light Detection And Ranging)**
A sensor that emits laser pulses and measures time-of-flight to generate distance measurements. A rotating 3D LiDAR generates a point cloud of the environment.

**LLM (Large Language Model)**
A Transformer-based neural network trained on massive text corpora. In Physical AI, used as a high-level task planner that decomposes natural-language goals into robot action sequences.

**LoRA (Low-Rank Adaptation)**
A parameter-efficient fine-tuning technique that adds small trainable matrices to frozen model weights. Used to fine-tune large VLA models on task-specific robot demonstrations with limited GPU memory.

---

## M

**MPPI (Model Predictive Path Integral)**
A sampling-based optimal control algorithm used as a local planner in Nav2. Generates smooth, kinodynamically feasible trajectories by sampling thousands of rollouts on the GPU.

---

## N

**Nav2**
The ROS 2 navigation stack. Provides a full pipeline from sensor input to velocity output, including costmaps, global/local planners, behaviour trees, and recovery behaviours.

**NITROS (NVIDIA Isaac Transport for ROS)**
A zero-copy data transport layer for Isaac ROS. Eliminates CPU overhead when moving tensor data between ROS 2 topics and GPU memory.

**Node (ROS 2)**
A single executable process in a ROS 2 system. Each node has a single responsibility and communicates with other nodes via topics, services, and actions.

**nvblox**
An NVIDIA GPU-accelerated 3D occupancy and TSDF mapper. Used in Isaac Perceptor to build real-time 3D obstacle maps from depth camera input.

---

## O

**Ollama**
A local LLM inference server that exposes an OpenAI-compatible API. Enables running Llama, Qwen, and other open models locally on CPU or GPU without cloud dependency.

**OpenVLA**
An open-source Vision-Language-Action model from Stanford. Based on Llama 2 7B + DINOv2. Trained on the Open X-Embodiment dataset. Weights available under Apache 2.0.

---

## P

**Parameter (ROS 2)**
A named, typed configuration value on a node. Can be read and written at runtime via `ros2 param` CLI or the parameter service API.

**Physical AI**
AI systems that perceive the physical world through sensors and act upon it through actuators. Characterised by real-time constraints, safety requirements, and embodiment.

**PID Controller**
Proportional-Integral-Derivative controller. A feedback control algorithm that computes a corrective output based on the error, its integral, and its derivative. The workhorse of joint-level robot control.

**π0 (pi-zero)**
A general-purpose robot foundation model from Physical Intelligence (2024). Uses a flow-matching action head on a VLM backbone (PaliGemma), trained across multiple robot embodiments.

**Point Cloud**
A set of 3D points in Cartesian space, typically produced by a LiDAR or depth camera. In ROS 2, represented as `sensor_msgs/PointCloud2`.

---

## Q

**QoS (Quality of Service)**
DDS policies controlling message delivery guarantees in ROS 2. Key policies: Reliability (RELIABLE vs BEST_EFFORT), Durability (VOLATILE vs TRANSIENT_LOCAL), and History depth.

---

## R

**RAG (Retrieval-Augmented Generation)**
An AI technique that augments an LLM's responses with information retrieved from an external knowledge base. This textbook's chatbot uses RAG over the `docs/` folder.

**Replicator (Isaac Sim)**
A Python API and GUI tool in Isaac Sim for scripting synthetic data generation pipelines. Supports randomisation of textures, lighting, object poses, and camera parameters.

**ROS 2 (Robot Operating System 2)**
An open-source middleware framework for robot software. Provides a publish-subscribe communication system (via DDS), a type system, build tools, and ecosystem of packages.

**RT-2 (Robotic Transformer 2)**
A VLA model from Google DeepMind that represents robot actions as discretised text tokens, using the same autoregressive LLM decoder as language generation.

---

## S

**SDF (Simulation Description Format)**
Gazebo's native scene and robot description format. Supports features beyond URDF: nested models, world files, multiple physics engines, lights, and atmosphere.

**SDG (Synthetic Data Generation)**
The automated production of annotated training data (images, depth maps, bounding boxes, segmentation masks) from a simulator, eliminating manual labelling.

**Sensor Fusion**
The combination of data from multiple sensor sources to produce an estimate more accurate than any individual sensor. Typically implemented with an EKF or particle filter.

**Service (ROS 2)**
A synchronous, bidirectional communication channel in ROS 2. A server exposes a named endpoint; a client sends a request and waits for a response. For short-duration operations (< 1 second).

**SLAM (Simultaneous Localisation and Mapping)**
The task of estimating a robot's pose while simultaneously building a map of the environment. Can be performed with LiDAR (LiDAR SLAM) or cameras (Visual SLAM).

---

## T

**TensorRT**
NVIDIA's deep learning inference optimisation toolkit. Compiles, prunes, and quantises trained models for low-latency, high-throughput inference on NVIDIA GPUs.

**TF2 (Transform Library 2)**
The ROS 2 coordinate frame tracking library. Maintains a time-stamped tree of transforms between frames (e.g., `map → odom → base_link → camera_link`).

**Topic (ROS 2)**
A named, typed, unidirectional data channel in ROS 2. Publishers write to it; multiple subscribers read from it asynchronously. Used for continuous data streams.

---

## U

**URDF (Unified Robot Description Format)**
An XML format for describing robot kinematics, dynamics, and visual/collision geometry. The standard robot model format in the ROS ecosystem.

**USD (Universal Scene Description)**
An Pixar-originated open file format for 3D scenes. The native format of NVIDIA Isaac Sim and Omniverse.

---

## V

**VAD (Voice Activity Detection)**
An algorithm that detects when a person is speaking vs. silent. Used in real-time ASR pipelines to segment audio into utterances before passing to Whisper.

**VLA (Vision-Language-Action)**
A neural network architecture that takes visual and language inputs and outputs robot action commands. Combines a vision encoder, language model backbone, and action head.

**Visual SLAM (vSLAM)**
A SLAM variant that uses camera images (and optionally IMU) rather than LiDAR for pose estimation and mapping.

**VoxelGrid Filter**
A point cloud downsampling algorithm that divides space into a 3D grid and replaces all points in each voxel with their centroid.

---

## W

**WBC (Whole-Body Control)**
An optimal control approach for humanoid robots that simultaneously optimises torques across all degrees of freedom to satisfy multiple tasks (balance, footstep, manipulation) with defined priorities.

**Whisper**
OpenAI's open-source ASR model trained on 680,000 hours of multilingual audio. Available in sizes from `tiny` (39M params) to `large-v3` (1.55B params). License: MIT.

---

## Z

**Zero-Shot Generalisation**
The ability of a model to correctly handle tasks or objects it was never explicitly trained on, by leveraging general knowledge learned during pre-training.
