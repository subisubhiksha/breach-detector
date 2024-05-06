document.addEventListener("DOMContentLoaded", function () {
  const checkButton = document.getElementById("checkButton");
  const result = document.getElementById("result");

  checkButton.addEventListener("click", async () => {
    const password = document.getElementById("password").value;
    result.textContent = "Checking...";

    try {
      // Hash the password using SHA-1
      const passwordHash = await sha1(password);
      const passwordPrefix = passwordHash.substring(0, 5);
      const passwordSuffix = passwordHash.substring(5);

      // Check password
      const passwordResponse = await fetch(
        `https://api.pwnedpasswords.com/range/${passwordPrefix}`,
        {
          method: "GET",
          headers: {
            "User-Agent": "Breach-Checker",
          },
        }
      );

      const passwordBreached = await checkPasswordInResponse(passwordResponse, passwordSuffix);

      if (passwordBreached) {
        result.textContent = `Password '${password}' has been breached.`;
      } else {
        result.textContent = `Password '${password}' has not been breached.`;
      }
    } catch (error) {
      result.textContent = "Error checking the password.";
    }
  });
});

// Function to hash the password using SHA-1
async function sha1(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
  return hashHex.toUpperCase();
}

// Function to check if the password hash suffix exists in the response
async function checkPasswordInResponse(response, suffix) {
  if (response.status !== 200) {
    return false;
  }

  const text = await response.text();
  const hashes = text.split("\n");

  for (const hash of hashes) {
    const parts = hash.split(":");
    if (parts[0] === suffix) {
      return true;
    }
  }

  return false;
}
