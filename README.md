# LLM Feedback Prompt Generator

A lightweight, browser-based app for educators to quickly generate rich, structured feedback for students using large language models like ChatGPT.

Created by [Jon Westfall](mailto:jon@jonwestfall.com) and ChatGPT.

---

## ✨ Features

- ✅ Define custom feedback options with labels and descriptions  
- ✅ Enter student names, grades, select relevant feedback, and generate prompts  
- ✅ Customizable prompt instructions (prepended to every output)  
- ✅ Supports CSV import/export for feedback options and student data  
- ✅ Includes student grades in output  
- ✅ Light/Dark mode toggle  
- ✅ Printable feedback setup  
- ✅ Local storage persistence (no logins or cloud sync)  
- ✅ Installable as a PWA (Progressive Web App)

---

## 📸 Screenshots

### Feedback Options Setup
![Feedback Options](./options.png)

### Student Feedback Table
![Student Grid](./students.png)

### Example Prompt Output
![Example Output](./example.png)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/llm-feedback-prompts.git
cd llm-feedback-prompts
```

### 2. Install Dependenciesv
```bash
npm install
```

### 3. Start the deelopment Server
```bash
npm run dev
```
Visit http://localhost:5173 to use the app locally.

### Build for Production
```bash
npm run build
```
## 📦 Deployment

This app works great when deployed as a PWA. You can try [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) for one-click deployment.

---

## 🧠 How It Works

1. You define feedback options (e.g., "Too Short", "Needs Citations")
2. You enter student names and grades, and select the appropriate checkboxes
3. The app generates a custom feedback prompt using your predefined options
4. You paste that prompt into ChatGPT or another LLM to expand it into rich, natural feedback
5. You can copy prompts or export a full student table to CSV

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
