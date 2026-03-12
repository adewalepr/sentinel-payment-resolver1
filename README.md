# 🏨 The Sentinel Suites - Automated Luxury Booking System

A high-end hospitality solution integrating **Softr**, **Airtable**, **Make.com**, and **Flutterwave** to create a seamless, zero-touch booking experience.

## 🚀 Project Overview
The Sentinel Suites is a proof-of-concept for a modern hotel management system. It replaces manual booking with an automated workflow that handles guest registration, secure payments, and instant email confirmations.

## 🛠 The Tech Stack
* **Frontend:** [Softr](https://www.softr.io/) - Used for the luxury UI and Guest Registry interface.
* **Database:** [Airtable](https://airtable.com/) - Acts as the Central Management System (CMS) and Guest Database.
* **Automation:** [Make.com](https://www.make.com/) - The "Brain" that triggers emails and updates records.
* **Payments:** [Flutterwave](https://flutterwave.com/) - Secure payment gateway integration.

## 🔄 The System Workflow
1. **Discovery:** Guest browses suites via the Softr dynamic grid.
2. **Registration:** Guest submits details through the integrated Guest Registry form.
3. **Data Capture:** Information is instantly synced to the **Airtable Sentinel Engine**.
4. **Handoff:** Softr triggers a secure redirect to the **Flutterwave** payment portal.
5. **Automation:** **Make.com** detects the new Airtable record and dispatches a personalized HTML confirmation email via Gmail.

## 📸 System Architecture
*<img width="1215" height="519" alt="image" src="https://github.com/user-attachments/assets/5d1628d3-7ed8-4c3a-97f1-599b46fd5143" />
*
*<img width="1112" height="600" alt="image" src="https://github.com/user-attachments/assets/d309c140-f8ff-4eb2-87aa-5017e3741ec4" />
*

## 💡 Key Features
* **Dynamic Room Selection:** Dropdown logic that maps room types to specific pricing.
* **Instant Handoff:** Seamless transition from data capture to payment.
* **Automated Concierge:** Zero-latency email responses for guests.

---
*Developed for the Technical Challenge 2026*
