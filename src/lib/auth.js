// lib/auth.js

export async function loginCustomer(email, password) {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    console.log("Shopify Login Response:", result); // Debug response

    if (response.ok && result.token) {
      return {
        token: result.token,
        expiresAt: result.expiresAt,
      };
    } else {
      console.error("Login failed:", result);
      throw new Error(result.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}


export async function registerCustomer(firstName, lastName, email, password) {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const result = await response.json();

    if (response.ok && result.customer) {
      return result.customer;
    } else {
      throw new Error(result.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error.message);
    return null;
  }
}