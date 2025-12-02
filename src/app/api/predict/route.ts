import { NextRequest, NextResponse } from "next/server";

const HF_SPACE_URL = "https://jasonfor2020-jb-hot-regression.hf.space";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Step 1: Upload the file to Gradio
    const uploadFormData = new FormData();
    uploadFormData.append("files", image);

    const uploadResponse = await fetch(
      `${HF_SPACE_URL}/gradio_api/upload?upload_id=${crypto.randomUUID()}`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload error:", errorText);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const uploadedPaths = await uploadResponse.json();
    const filePath = uploadedPaths[0];

    // Step 2: Submit the prediction request with the uploaded file path
    const submitResponse = await fetch(`${HF_SPACE_URL}/gradio_api/call/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [{ path: filePath }],
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("Submit error:", errorText);
      return NextResponse.json(
        { error: "Failed to submit prediction" },
        { status: 500 }
      );
    }

    const { event_id } = await submitResponse.json();

    // Step 3: Get the result via SSE
    const resultResponse = await fetch(
      `${HF_SPACE_URL}/gradio_api/call/predict/${event_id}`
    );

    if (!resultResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get prediction result" },
        { status: 500 }
      );
    }

    const resultText = await resultResponse.text();

    // Parse SSE response - look for the "complete" event with data
    const lines = resultText.split("\n");
    let prediction = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("event: complete")) {
        // Next line should be the data
        const dataLine = lines[i + 1];
        if (dataLine?.startsWith("data: ")) {
          const jsonData = JSON.parse(dataLine.slice(6));
          prediction = jsonData[0];
          break;
        }
      }
    }

    if (prediction === null) {
      return NextResponse.json(
        { error: "Could not parse prediction result" },
        { status: 500 }
      );
    }

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "An error occurred during prediction" },
      { status: 500 }
    );
  }
}
