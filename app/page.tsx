export default function PrivacyPolicyPage() {
  const lastUpdated = "March 23, 2026";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans dark:bg-zinc-950 dark:text-gray-200 selection:bg-blue-200 selection:text-blue-900">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-950 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-8 md:p-12 space-y-10 leading-relaxed text-base md:text-lg border border-gray-100 dark:border-zinc-800">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p>
              This Football Training App is designed for internal use by a
              football academy to manage players, coaches, and training
              sessions. This Privacy Policy explains what information we collect
              and how we use it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We only collect the information necessary to operate the app:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email, and profile
                details used for login and identification.
              </li>
              <li>
                <strong>Player Information:</strong> Basic player profile data
                managed by coaches and administrators.
              </li>
              <li>
                <strong>Session Data:</strong> Training session information
                created and managed by coaches.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              3. How We Use Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                To provide login access for Super Admins, Coaches, and Players.
              </li>
              <li>To manage organizations, players, and training sessions.</li>
              <li>
                To allow players to request admission and coaches to approve or
                reject requests.
              </li>
              <li>
                To display player profiles and related training information
                within the app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              4. Sharing of Information
            </h2>
            <p>Information is only shared within the system:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Super Admins can manage organizations.</li>
              <li>Coaches can manage players and sessions.</li>
              <li>Players can view their own profiles.</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share personal data with external third
              parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p>
              We take reasonable measures to protect your data. However, no
              system can guarantee complete security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. User Rights</h2>
            <p>
              Users can request updates or deletion of their data by contacting
              the administrator of the academy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              7. Changes to This Policy
            </h2>
            <p>
              This policy may be updated from time to time. Updates will be
              reflected with the “Last Updated” date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
            <p>
              If you have any questions, please contact us at{" "}
              <a
                href="mailto:rhythm4538@gmail.com"
                className="text-blue-600 underline"
              >
                rhythm4538@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Football Training App</p>
        </footer>
      </div>
    </div>
  );
}
