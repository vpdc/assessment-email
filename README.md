# Email Cadence System – Temporal.io Monorepo

A monorepo implementation of a dynamic email cadence engine using:

- **Next.js (App Router)** – Web UI
- **NestJS** – API layer
- **Temporal.io (TypeScript SDK)** – Durable workflow execution
- **Turborepo + pnpm** – Monorepo orchestration
- **Zod** – Runtime validation
- **Shared package (`packages/common`)** – Shared schemas + types

The focus of this exercise is:

- Long-running workflow execution
- Updating workflows while running (via Temporal signals)
- Clean monorepo architecture
- Strong separation of concerns
- Deterministic workflow logic

---

# 🏗 Monorepo Structure

```
apps/
  api/        # NestJS API (controllers, services, Temporal client)
  web/        # Next.js UI (App Router)
  worker/     # Temporal worker (workflows + activities)

packages/
  common/     # Shared schemas, types, env helpers
  eslint-config/
  typescript-config/
```

---

# 🧠 Architecture Overview

```
Browser (Next.js)
        ↓
NestJS API
        ↓
Temporal Client
        ↓
Temporal Workflow (durable state)
        ↓
Activities (mock email sending)
        ↓
Temporal Worker
```

## Responsibilities

### `apps/web`
- Minimal UI
- Calls API routes
- Displays workflow state

### `apps/api`
- Stores cadence definitions (in-memory)
- Starts workflows
- Sends signals to running workflows
- Exposes status query endpoints
- Validates inputs via Zod

### `apps/worker`
- Contains:
  - `email-cadence.workflow.ts`
  - `email.activity.ts`
- Executes workflow logic
- Maintains durable state inside Temporal

### `packages/common`
- Shared Zod schemas
- Shared workflow input/output types
- Environment helpers
- Connection configuration

---

# 🚀 Core Features

## 1️⃣ Create / Update Cadence

Cadence schema:

```json
{
  "id": "cad_123",
  "name": "Welcome Flow",
  "steps": [
    { "id": "1", "type": "SEND_EMAIL", "subject": "Welcome", "body": "Hello" },
    { "id": "2", "type": "WAIT", "seconds": 10 },
    { "id": "3", "type": "SEND_EMAIL", "subject": "Follow up", "body": "Checking in" }
  ]
}
```

Cadences are stored in-memory within the API layer.

---

## 2️⃣ Enroll Contact (Starts Workflow)

When an enrollment is created:

- A Temporal workflow is started
- `workflowId = enrollmentId`
- Workflow receives cadence steps
- Steps execute sequentially

---

## 3️⃣ Dynamic Updates While Running

The workflow exposes a **signal**:

```
updateCadence(newSteps)
```

When invoked:

- Completed steps remain completed
- `currentStepIndex` is preserved
- If new steps are shorter than current index → workflow completes
- Otherwise, execution continues from current index
- `stepsVersion` increments

This ensures deterministic behavior.

---

# 🔄 Workflow State

The workflow internally tracks:

- `currentStepIndex`
- `status` (RUNNING | COMPLETED)
- `stepsVersion`
- `steps[]`

State is durable and stored in Temporal — no database required.

---

# 📡 API Endpoints

## Cadences

Create:

```
POST /cadences
```

Get:

```
GET /cadences/:id
```

Update:

```
PUT /cadences/:id
```

---

## Enrollments

Start Workflow:

```
POST /enrollments
```

Body:

```json
{
  "cadenceId": "cad_123",
  "contactEmail": "user@example.com"
}
```

Get Workflow State:

```
GET /enrollments/:id
```

Example response:

```json
{
  "status": "RUNNING",
  "currentStepIndex": 1,
  "stepsVersion": 2
}
```

Update Running Workflow:

```
POST /enrollments/:id/update-cadence
```

---

# 📡 API Examples

Base URL (local):

```
http://localhost:3000
```

---

# 🔹 Health Check

### GET /

```bash
curl http://localhost:3000/
```

---

# 🔹 Cadences

## 1️⃣ Create Cadence

### POST /cadences

```bash
curl -X POST http://localhost:3000/cadences \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cad_123",
    "name": "Welcome Flow",
    "steps": [
      {
        "id": "step1",
        "type": "SEND_EMAIL",
        "subject": "Welcome!",
        "body": "Thanks for signing up."
      },
      {
        "id": "step2",
        "type": "WAIT",
        "seconds": 5
      },
      {
        "id": "step3",
        "type": "SEND_EMAIL",
        "subject": "Follow up",
        "body": "Just checking in!"
      }
    ]
  }'
```

---

## 2️⃣ Get Cadence

### GET /cadences/:id

```bash
curl http://localhost:3000/cadences/cad_123
```

---

## 3️⃣ Update Cadence

### PUT /cadences/:id

```bash
curl -X PUT http://localhost:3000/cadences/cad_123 \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cad_123",
    "name": "Welcome Flow v2",
    "steps": [
      {
        "id": "step1",
        "type": "SEND_EMAIL",
        "subject": "Updated Welcome!",
        "body": "We’re glad you’re here."
      },
      {
        "id": "step2",
        "type": "WAIT",
        "seconds": 10
      }
    ]
  }'
```

---

# 🔹 Enrollments

## 4️⃣ Create Enrollment (Starts Workflow)

### POST /enrollments

```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": "enr_001",
    "cadenceId": "cad_123",
    "contactEmail": "user@example.com"
  }'
```

Behavior:

- Starts a Temporal workflow
- `workflowId = enrollmentId`
- Returns initial workflow state

Example response:

```json
{
  "enrollmentId": "enr_001",
  "status": "RUNNING",
  "currentStepIndex": 0,
  "stepsVersion": 1
}
```

---

## 5️⃣ Get Enrollment State

### GET /enrollments/:id

```bash
curl http://localhost:3000/enrollments/enr_001
```

Example response:

```json
{
  "status": "RUNNING",
  "currentStepIndex": 1,
  "stepsVersion": 1
}
```

---

## 6️⃣ Update Running Cadence (Signal Workflow)

### POST /enrollments/:id/update-cadence

```bash
curl -X POST http://localhost:3000/enrollments/enr_001/update-cadence \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [
      {
        "id": "step1",
        "type": "SEND_EMAIL",
        "subject": "Modified Welcome",
        "body": "Updated while running."
      },
      {
        "id": "step2",
        "type": "WAIT",
        "seconds": 3
      },
      {
        "id": "step3",
        "type": "SEND_EMAIL",
        "subject": "New Final Step",
        "body": "This was added dynamically."
      }
    ]
  }'
```

Behavior:

- Sends `updateCadence` signal to running Temporal workflow
- Keeps completed steps unchanged
- Preserves `currentStepIndex`
- Increments `stepsVersion`
- Continues execution with new steps


---

# 🔐 Validation

All request bodies are validated using:

- Zod schemas from `packages/common`
- Custom NestJS `ZodValidationPipe`

Invalid payloads return 400 with validation errors.

---

# 🧠 Important Implementation Detail

The `enrollmentId` is used directly as the Temporal `workflowId`.

This allows:

- Direct querying via workflow ID
- Direct signaling
- No additional persistence layer required
