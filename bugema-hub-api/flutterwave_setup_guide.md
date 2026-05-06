# Flutterwave Payment Setup Guide

Follow these steps to enable real payments on your platform.

## 1. Create a Flutterwave Account
1.  Go to [Flutterwave Signup](https://dashboard.flutterwave.com/signup).
2.  Select **"Individual"** or **"Business"** (Individual is usually easier for starting).
3.  Choose **Uganda** as your country.

## 2. Get your API Keys
1.  Log in to your [Flutterwave Dashboard](https://dashboard.flutterwave.com/).
2.  Navigate to **Settings** (bottom left) -> **API Keys**.
3.  You will see two sets of keys: **Test Keys** (for development) and **Live Keys** (for real money).
4.  Copy these three values and add them to your `bugema-hub-api/.env` file:
    ```bash
    FLW_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxx
    FLW_SECRET_KEY=FLWSECK_TEST-xxxxxxxx
    FLW_ENCRYPTION_KEY=xxxxxxxxxxxx
    ```
    > [!TIP]
    > Start with your **Test Keys** first to make sure everything works without spending real money!

## 3. Configure the Webhook
Webhooks allow Flutterwave to tell your server *instantly* when a student has successfully paid.
1.  In your Flutterwave Dashboard, go to **Settings** -> **Webhooks**.
2.  **URL**: Set this to `https://<YOUR_SERVER_URL>/api/v1/payments/flutterwave/webhook`.
    *   *Note: If you are testing locally, you will need a tool like **ngrok** to get a public URL.*
3.  **Secret Hash**: Type any secret word (e.g., `bugema_secret_123`).
4.  **Secret Hash (Env)**: Add that same word to your `.env` file:
    ```bash
    FLW_SECRET_HASH=bugema_secret_123
    ```
5.  Click **"Save"**.

## 4. Test Payment (Mobile Money)
1.  Go to your signup page.
2.  Fill in Step 1 & 2.
3.  In the Payment step, choose **MTN** or **Airtel**.
4.  Enter a phone number (For test mode, use Flutterwave's [Test Cards/Numbers](https://developer.flutterwave.com/docs/collecting-payments/testing-payments)).
5.  Check your terminal logs to see the payment being initiated!

---

> [!IMPORTANT]
> Once you are ready to receive real money, switch the keys in your `.env` to the **Live Keys** and update the Webhook URL to your real production server address.
