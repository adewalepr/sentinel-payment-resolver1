# Sentinel: Autonomous E-Commerce Booking & Identity Engine

**Sentinel** is an intelligent, full-stack automation solution designed to bridge the gap between customer acquisition, payment processing, and CRM management. Built for the **AI & Automation Innovators Challenge (AAIC)**, it eliminates "Ghost Payments" by synchronizing front-end user data with real-time financial webhooks.

## 🚀 The Problem
E-commerce businesses often lose customer data when payments happen in isolation from their registration forms. Manual reconciliation of "who paid for what" is slow, prone to error, and prevents instant customer fulfillment.

## 🧠 The Solution: The "Front-to-Back" Architecture
Sentinel creates a seamless loop by capturing user intent *before* the transaction occurs, ensuring 100% data integrity.

### Key Features (Stage 1):
* **Integrated Booking Portal:** A high-conversion front-end built on **Softr** to capture user data first.
* **Pending-to-Paid Logic:** Automatically stages customer data in **Airtable** as "Pending" until the financial "Handshake" is confirmed.
* **Real-time Webhook Synchronization:** Instant payment validation via **Flutterwave**.
* **Automated Retention Messaging:** Real-time WhatsApp triggers via **Twilio API** to deliver instant payment confirmation and loyalty status updates.

---

## 🛠️ Technical Stack
* **Frontend:** Softr (User Interface & Booking)
* **Database:** Airtable (Relational CRM & Logic Base)
* **Logic Engine:** Make.com / n8n (The "Brain")
* **Payment Gateway:** Flutterwave (API/Webhook)
* **Communication:** Twilio (WhatsApp Business API)

---

## 🧪 How to Test (For Judges)
To ensure a seamless evaluation without real-world financial charges, this project is in **Sandbox/Test Mode**.

1.  **Register:** Visit the [Live Deployment Link] and fill out the Booking Form.
2.  **Payment:** Upon submission, you will be redirected to the Flutterwave Test Environment.
    * **Test Card:** `4444 4444 4444 4444`
    * **CVV:** `123` | **Pin:** `1234`
3.  **Verification:** Watch the "Live Dashboard" on the site to see your status flip from **Pending** to **Paid** in real-time.
4.  **WhatsApp Delivery:** (Optional) To receive the live message, join the Twilio Sandbox by sending `join [Your-Sandbox-Code]` to `+1 415 523 8886`. *Note: In production, this is a native opt-in experience.*

---

## 📂 Project Structure
* `/workflows` - Exported JSON files of the automation logic.
* `/docs` - Technical architecture and data schema.
