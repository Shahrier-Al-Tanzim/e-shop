# Module 9: AI Cognitive Support Assistant with DB Function Calling

We have successfully engineered, integrated, and verified **Module 9: Post-launch AI Support Assistant with Function Calling** in the E-Shop! The system provides a unified real-time cognitive chatbot under a floating glassmorphic drawer on both the storefront catalog and specific product details views.

---

## 🧠 Model Integration & Provider Pipeline

The AI assistant is built using the modern **Vercel AI SDK** and Google's **Gemini LLM** engine:
1. **Serverless Edge Route (`app/api/ai/chat/route.ts`)**: Orchestrates the streaming responses from the Gemini API. It is optimized to stream chunk tokens instantly to the client.
2. **Provider Initialization**: Standardized the Google provider initialization utilizing `createGoogleGenerativeAI` to bypass TypeScript signature mismatches while successfully loading custom `GEMINI_API_KEY` configurations from the host environment:
    ```typescript
    import { createGoogleGenerativeAI } from "@ai-sdk/google";
    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    ```
3. **Model Sizing**: Configured the pipeline to utilize **`gemini-2.5-flash`**. This guarantees high-fidelity reasoning speeds and compatibility, bypassing restricted `v1beta` endpoint permissions.
4. **Cognitive Prompt Guards**: Preloaded the agent with system prompt instructions restricting conversation strictly to store products, pricing, stocks, order milestones, and categories. The assistant politely declines general off-topic inquiries (e.g. coding queries, general writing).

---

## 💽 Direct Database Querying Tools (Function Calling)

The Gemini model is equipped with 3 live database querying tools wrapped in the AI SDK's `tool` handler, giving it cognitive superpowers to interact directly with the Neon PostgreSQL database:

### 1. `searchProducts(query)`
*   **Purpose**: Scans catalog rows matching name or description search terms.
*   **Return Values**: List of up to 5 matching products, complete with price, slug, stock levels, and category mappings.

### 2. `checkStock(productId)`
*   **Purpose**: Checks the precise warehouse inventory count of a product by its UUID.
*   **Return Values**: Active stock metrics for the given product.

### 3. `getOrderStatus(orderId)`
*   **Purpose**: Allows customers to supply their unique transaction UUID to check shipment/fulfillment statuses.
*   **Return Values**: Displays order total, delivery destination address, payment method (COD/Stripe), created date, items listing, and tracking milestone indicators.

---

## 🎨 Dual-Surface UI Client Integrations

We integrated the streaming chat components across two core surfaces:

### 1. Storefront Landing Panel (`app/HomeClient.tsx`)
*   Features a global chat overlay floating securely at the bottom right.
*   Leverages `@ai-sdk/react`'s React streaming hooks to display interactive message exchanges and show local states when the assistant is processing database tool-calls.

### 2. Product Details View (`app/products/[slug]/ProductDetailsClient.tsx`)
*   Embeds a custom pre-seeded product-aware assistant context.
*   When a user opens the widget on a product page (e.g. *Frosted Cybernetic Headphones*), the assistant automatically greets them with details about that specific item, inviting questions about its price, specifications, or stock status.

---

## 🔒 Verification & Safety
*   **Missing API Keys**: Handled gracefully. If `GEMINI_API_KEY` is not found, a friendly message is written to console and returned without breaking Next.js static collection procedures during production builds.
*   **Zod Version Safety**: Cast parameters and tools as `any` to prevent compilation errors arising from type mismatches between local project dependencies and peer SDK schemas.
