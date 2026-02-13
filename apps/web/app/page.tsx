"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../common/api-fetch";
import { Cadence } from "@repo/common";

const defaultCadence = {
  id: "cad_123",
  name: "Welcome Flow",
  steps: [
    { id: "1", type: "SEND_EMAIL", subject: "Welcome", body: "Hello there" },
    { id: "2", type: "WAIT", seconds: 10 },
    { id: "3", type: "SEND_EMAIL", subject: "Follow up", body: "Checking in" },
  ],
};

export function getMessageFromError(error: Error): string {
  try {
    const parsed = JSON.parse(error.message);

    if (typeof parsed === "object" && parsed !== null) {
      return parsed.message ?? error.message;
    }

    return error.message;
  } catch {
    // message is not JSON
    return error.message;
  }
}

export default function Home() {
  const [cadenceJson, setCadenceJson] = useState(
    JSON.stringify(defaultCadence, null, 2),
  );

  const [state, setState] = useState<any>(null);
  const [contactEmail, setContactEmail] = useState("test@example.com");
  let cadence: Cadence | null;

  try {
    cadence = JSON.parse(cadenceJson);
  } catch (error) {
    cadence = null;
  }

  const canQueryEnrollment = cadence?.id && contactEmail;
  const enrollmentId = `${cadence?.id}:${contactEmail}`;

  // ---- Poll workflow state ----
  useEffect(() => {
    setState(null);
    if (!canQueryEnrollment) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiFetch(`/enrollments/${enrollmentId}`);
        setState(data);
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [cadenceJson, contactEmail]);

  async function createCadence() {
    try {
      const parsed = JSON.parse(cadenceJson);
      await apiFetch("/cadences", {
        method: "POST",
        body: JSON.stringify(parsed),
      });
      alert("Cadence created");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Failed to create cadence: ${getMessageFromError(error)}`);
      } else {
        alert("Failed to create cadence: Unknown error");
      }
    }
  }

  async function updateCadenceDefinition() {
    try {
      const parsed = JSON.parse(cadenceJson);
      await apiFetch(`/cadences/${parsed.id}`, {
        method: "PUT",
        body: JSON.stringify(parsed),
      });
      alert("Cadence updated");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Failed to update cadence: ${getMessageFromError(error)}`);
      } else {
        alert("Failed to update cadence: Unknown error");
      }
    }
  }

  async function enroll() {
    try {
      const parsed = JSON.parse(cadenceJson);
      const result = await apiFetch("/enrollments", {
        method: "POST",
        body: JSON.stringify({
          cadenceId: parsed.id,
          contactEmail,
        }),
      });
      alert("Email enrolled to cadence");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Failed to enroll email to cadence: ${getMessageFromError(error)}`);
      } else {
        alert("Failed to enroll email to cadence: Unknown error");
      }
    }
  }

  async function updateRunningWorkflow() {
    try {
      const parsed = JSON.parse(cadenceJson);
      await apiFetch(`/enrollments/${enrollmentId}/update-cadence`, {
        method: "POST",
        body: JSON.stringify({
          steps: parsed.steps,
        }),
      });

      alert("Workflow updated");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Failed to update workflow: ${getMessageFromError(error)}`);
      } else {
        alert("Failed to update workflow: Unknown error");
      }
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Email Cadence Admin</h1>

      <h2>Cadence JSON</h2>
      <textarea
        rows={20}
        cols={100}
        value={cadenceJson}
        onChange={(e) => setCadenceJson(e.target.value)}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={createCadence}>Create Cadence</button>
        <button onClick={updateCadenceDefinition} style={{ marginLeft: 10 }}>
          Update Cadence Definition
        </button>
      </div>

      <hr style={{ margin: "30px 0" }} />

      <h2>Enroll Contact</h2>
      <input
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        placeholder="Contact Email"
      />
      <button onClick={enroll} style={{ marginLeft: 10 }}>
        Enroll
      </button>

      {enrollmentId && (
        <>
          <hr style={{ margin: "30px 0" }} />

          <h2>Running Workflow</h2>
          <p>
            <strong>Enrollment ID:</strong> {enrollmentId}
          </p>

          <pre>{JSON.stringify(state, null, 2)}</pre>

          <button onClick={updateRunningWorkflow}>
            Update Running Workflow Steps
          </button>
        </>
      )}
    </div>
  );
}
