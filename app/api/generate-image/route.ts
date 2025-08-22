import { type NextRequest, NextResponse } from "next/server"

async function generateImageWithRetry(requestBody: any, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("https://api.ideogram.ai/generate", {
        method: "POST",
        headers: {
          "Api-Key": "WOf-zDJUHw8ZKz6KE9cupxVw7BhousAlI6xIQqwKtA9kfaRESnvZk5XylvCf6MuwTysz-vGeHloET8cvgldkaw",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()

        // Check if it's a rate limiting error
        if (errorText.includes("maximum number of requests") || response.status === 429) {
          if (attempt < maxRetries) {
            console.log(`[v0] Rate limited on attempt ${attempt}, will retry in ${Math.pow(1.5, attempt) * 500}ms`)
            const waitTime = Math.pow(1.5, attempt) * 500
            await new Promise((resolve) => setTimeout(resolve, waitTime))
            continue
          } else {
            console.error(`[v0] Rate limit exceeded after ${maxRetries} attempts`)
            throw new Error("Rate limit exceeded. Please try again in a few moments.")
          }
        }

        if (attempt === maxRetries) {
          console.error(`[v0] Ideogram API error after ${maxRetries} attempts:`, errorText)
        }
        throw new Error(`Ideogram API error: ${response.status}`)
      }

      const data = await response.json()
      if (attempt > 1) {
        console.log(`[v0] Ideogram API succeeded on attempt ${attempt}`)
      }
      return data
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      if (attempt === maxRetries) {
        console.error(`[v0] Network error after ${maxRetries} attempts:`, error)
      }

      const waitTime = Math.pow(1.5, attempt) * 500
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const requestBody = {
      image_request: {
        prompt: prompt,
        aspect_ratio: "ASPECT_1_1",
        model: "V_2_TURBO",
        magic_prompt_option: "AUTO",
        seed: Math.floor(Math.random() * 1000000),
      },
    }

    const data = await generateImageWithRetry(requestBody)

    if (data.data && data.data.length > 0) {
      // Return single image URL format that frontend expects
      return NextResponse.json({
        imageUrl: data.data[0].url,
        prompt: prompt,
      })
    }

    throw new Error("No images returned from Ideogram API")
  } catch (error) {
    console.error("Error generating image:", error)

    if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
      return NextResponse.json(
        {
          error: "Too many requests at once. Please wait a moment and try again.",
        },
        { status: 429 },
      )
    }

    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
