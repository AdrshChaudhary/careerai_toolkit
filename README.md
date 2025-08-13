# Firebase Studio

This is a NextJS starter created in Firebase Studio.

## Getting Started

To get this project running on your local machine, follow these steps:

### 1. Install Dependencies

First, you need to install the project dependencies using npm:

```bash
npm install
```

### 2. Set Up Environment Variables

This project requires Firebase credentials to connect to your Firebase project.

1.  Create a new file named `.env.local` in the root of the project.
2.  Add the following environment variables to the `.env.local` file, replacing the placeholder values with your actual Firebase project credentials. You can get these from the Firebase console in your project settings.

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    ```

### 3. Run the Development Server

Once the dependencies are installed and the environment variables are set, you can start the development server:

```bash
npm run dev
```

This will start the application, and you can view it in your browser at [http://localhost:9002](http://localhost:9002).

## Learn More

To get started, take a look at `src/app/page.tsx`.
