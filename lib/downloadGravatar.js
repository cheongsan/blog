const axios = require("axios")
const fs = require("fs")
const path = require("path")
const md5 = require("md5")
const { CONFIG } = require("../site.config")

const downloadGravatarImage = async (email, size) => {
  const hash = md5(email)
  const imageSize = size * 2
  const imageUrl = `https://www.gravatar.com/avatar/${hash}?s=${imageSize}&d=identicon`
  const fileName = `gravatar-${imageSize}.png`
  const filePath = path.join(__dirname, "../public", fileName)

  const response = await axios({
    url: imageUrl,
    responseType: "stream",
  })

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filePath))
      .on("finish", () => resolve())
      .on("error", (e) => reject(e))
  })
}

;(async () => {
  try {
    const sizes = [150, 200, 24]
    for (const size of sizes) {
      await downloadGravatarImage(CONFIG.profile.gravatar_email, size)
      console.log(`Downloaded gravatar-${size * 2}.png`)
    }
  } catch (error) {
    console.error("Error downloading Gravatar images:", error)
  }
})()
