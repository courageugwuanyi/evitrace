import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Evitrace Privacy Policy" },
      {
        name: "description",
        content: "Privacy policy for Evitrace web app and browser extension.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 text-slate-800">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 28, 2026</p>

      <section className="mt-8 space-y-3 text-sm leading-6">
        <p>
          Evitrace helps users capture work evidence and feedback for career development. This page
          explains what information we collect, how we use it, and your choices.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Information we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
          <li>Account information such as email address and profile details.</li>
          <li>Submitted content, including evidence notes, feedback text, and knowledge entries.</li>
          <li>
            Active tab URL context when you use the browser extension capture flow (only to help
            attach source context to entries you create).
          </li>
          <li>
            Basic product telemetry needed to operate reminders, authentication sync, and core app
            functionality.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">How we use information</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
          <li>Provide and secure your Evitrace workspace.</li>
          <li>Sync extension captures to your account.</li>
          <li>Support reminders, workflow features, and product reliability.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">What we do not do</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
          <li>We do not sell personal data.</li>
          <li>We do not collect your full browsing history.</li>
          <li>We do not collect page data unless you actively use Evitrace capture features.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Data sharing and processors</h2>
        <p className="mt-3 text-sm leading-6">
          Evitrace uses infrastructure providers to host the product and store data (such as Vercel
          and Supabase). These providers process data on our behalf to deliver the service.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Your choices</h2>
        <p className="mt-3 text-sm leading-6">
          You can edit or remove submitted content in your workspace and stop using the extension
          at any time by disabling or uninstalling it.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
        <p className="mt-3 text-sm leading-6">
          Questions about this policy can be sent through your Evitrace support channel or workspace
          administrator.
        </p>
      </section>

      <div className="mt-10 text-sm">
        <Link to="/" className="font-medium text-blue-700 hover:text-blue-600">
          Back to Evitrace
        </Link>
      </div>
    </main>
  );
}
