# DevTracker - Daily Coding Goals

DevTracker is a simple web application designed to help you track your daily coding goals, stay motivated, and manage your time effectively with a built-in Pomodoro timer.

## Features

*   **Goal Management:** Add, delete, and mark coding goals as complete.
*   **Goal Metadata:** Track priority, tags, and due times for each goal.
*   **Motivational Quotes:** Displays a new motivational quote each day to keep you inspired.
*   **Progress Tracking:** Visualizes your completed goals over time with a chart.
*   **Pomodoro Timer:** Includes a configurable Pomodoro timer to help you focus and manage work/break sessions.
*   **Dark Mode:** Toggle between light and dark themes for comfortable viewing.
*   **Local Storage:** Saves your goals, progress, and dark mode preference in your browser's local storage.

## Technologies Used

*   HTML
*   CSS (Tailwind CSS for styling)
*   JavaScript (Vanilla JS)
*   Chart.js (for progress visualization)
*   ZenQuotes API (for daily motivational quotes)

## Getting Started

To run DevTracker locally, follow these steps:

1.  **Clone the repository (or download the files):**
    ```bash
    # If you have git installed
    # git clone <repository-url>
    # cd DevTracker
    ```
    Alternatively, download the `index.html`, `style.css`, and `script.js` files into a single folder.

2.  **Open `index.html` in your browser:**
    Simply open the `index.html` file in your preferred web browser.

    *Optional: For a better development experience or if you encounter issues with the ZenQuotes API due to CORS, you can serve the files using a local HTTP server.*
    One simple way to do this is using `http-server` (requires Node.js and npm):
    ```bash
    # Install http-server globally (if you haven't already)
    npm install -g http-server

    # Navigate to the project directory in your terminal
    cd path/to/DevTracker

    # Start the server
    http-server .
    ```
    Then, open `http://localhost:8080` (or the URL provided by `http-server`) in your browser.

## How It Works

*   **`index.html`**: The main structure of the web page.
*   **`style.css`**: Contains custom styles and dark mode overrides. Tailwind CSS is used for most of the styling via CDN.
*   **`script.js`**: Handles all the application logic, including:
    *   Fetching and displaying motivational quotes.
    *   Managing (adding, deleting, toggling completion) daily goals.
    *   Storing and retrieving data from local storage.
    *   Rendering the progress chart using Chart.js.
    *   Implementing the Pomodoro timer functionality.
    *   Handling dark mode toggling.

## Contributing

Feel free to fork this project, make improvements, and submit pull requests!

## Roadmap

*   Weekly/monthly analytics and completion rate trends.
*   Streaks and reminders for consistency.
*   Optional cloud sync and export/import of goal data.

--- 

*This README was generated to help showcase the project.*
