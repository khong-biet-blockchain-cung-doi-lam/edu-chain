<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">


# EDU-CHAIN

<em>Empowering Education Through Blockchain Innovation</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/last-commit/khong-biet-blockchain-cung-doi-lam/edu-chain?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/khong-biet-blockchain-cung-doi-lam/edu-chain?style=flat&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/khong-biet-blockchain-cung-doi-lam/edu-chain?style=flat&color=0080ff" alt="repo-language-count">

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/Markdown-000000.svg?style=flat&logo=Markdown&logoColor=white" alt="Markdown">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Chai-A30701.svg?style=flat&logo=Chai&logoColor=white" alt="Chai">
<img src="https://img.shields.io/badge/TOML-9C4121.svg?style=flat&logo=TOML&logoColor=white" alt="TOML">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React">
<br>
<img src="https://img.shields.io/badge/Docker-2496ED.svg?style=flat&logo=Docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/Python-3776AB.svg?style=flat&logo=Python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Ethers-2535A0.svg?style=flat&logo=Ethers&logoColor=white" alt="Ethers">
<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/bat-31369E.svg?style=flat&logo=bat&logoColor=white" alt="bat">
<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=Axios&logoColor=white" alt="Axios">

</div>
<br>

---
Using Claude for generating tests and scripts
## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## Overview

edu-chain is an all-in-one developer platform designed to simplify the deployment and management of complex educational systems that integrate web interfaces, blockchain smart contracts, and backend services. It orchestrates multiple services, manages dependencies, and ensures a secure, scalable environment for development and testing.

**Why edu-chain?**

This project aims to streamline the development of decentralized educational platforms. The core features include:

- 🛠️ **Service Orchestration:** Automates startup and shutdown of backend, frontend, and blockchain services for a unified development experience.
- 🔒 **Secure Data Handling:** Implements encryption, IPFS storage, and blockchain-based verification to protect sensitive information.
- 📦 **Dependency Management:** Ensures consistent environments with well-defined dependencies and configurations across components.
- 🌐 **Blockchain Integration:** Supports smart contract deployment, interaction, and role-based access control for transparent, tamper-proof records.
- 🚀 **Development & Testing:** Facilitates rapid environment setup, testing workflows, and scalable deployment pipelines.

---

## Project Structure

```sh
└── edu-chain/
    ├── backend
    │   ├── Dockerfile
    │   ├── app
    │   ├── config.py
    │   ├── docker-compose.yml
    │   ├── migrations
    │   ├── requirement.txt
    │   ├── run.py
    │   ├── scripts
    │   └── tests
    ├── blockchain
    │   ├── .gitignore
    │   ├── README.md
    │   ├── contracts
    │   ├── hardhat.config.js
    │   ├── hardhat.config.ts.bak
    │   ├── ignition
    │   ├── package-lock.json
    │   ├── package.json
    │   └── test
    ├── frontend
    │   ├── login-form
    │   └── organizations
    ├── requirements.txt
    ├── start-all.bat
    ├── start_all_services.bat
    └── supabase
        ├── .gitignore
        └── config.toml
```

---

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Programming Language:** Python
- **Package Manager:** Pip, Npm
- **Container Runtime:** Docker

### Installation

Build edu-chain from the source and install dependencies:

1. **Clone the repository:**

    ```sh
    ❯ git clone https://github.com/khong-biet-blockchain-cung-doi-lam/edu-chain
    ```

2. **Navigate to the project directory:**

    ```sh
    ❯ cd edu-chain
    ```

3. **Install the dependencies:**

**Using [docker](https://www.docker.com/):**

```sh
❯ docker build -t khong-biet-blockchain-cung-doi-lam/edu-chain .
```
**Using [pip](https://pypi.org/project/pip/):**

```sh
❯ pip install -r requirements.txt
```
**Using [npm](https://www.npmjs.com/):**

```sh
❯ npm install
```

### Usage

Run the project with:

**Using [docker](https://www.docker.com/):**

```sh
docker run -it {image_name}
```
**Using [pip](https://pypi.org/project/pip/):**

```sh
python {entrypoint}
```
**Using [npm](https://www.npmjs.com/):**

```sh
npm start
```

### Testing

Edu-chain uses the {__test_framework__} test framework. Run the test suite with:

**Using [docker](https://www.docker.com/):**

```sh
echo 'INSERT-TEST-COMMAND-HERE'
```
**Using [pip](https://pypi.org/project/pip/):**

```sh
pytest
```
**Using [npm](https://www.npmjs.com/):**

```sh
npm test
```

---

## Contributing

- **💬 [Join the Discussions](https://github.com/khong-biet-blockchain-cung-doi-lam/edu-chain/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/khong-biet-blockchain-cung-doi-lam/edu-chain/issues)**: Submit bugs found or log feature requests for the `edu-chain` project.
- **💡 [Submit Pull Requests](https://github.com/khong-biet-blockchain-cung-doi-lam/edu-chain/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/khong-biet-blockchain-cung-doi-lam/edu-chain
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/khong-biet-blockchain-cung-doi-lam/edu-chain/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=khong-biet-blockchain-cung-doi-lam/edu-chain">
   </a>
</p>
</details>

---

<div align="left"><a href="#top">⬆ Return</a></div>

---
