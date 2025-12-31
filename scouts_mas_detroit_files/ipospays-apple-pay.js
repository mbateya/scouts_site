const applePayCurrentOrigin = window.location.hostname;
async function initializeApplePay(applePayTransactionInfo, buttonStyles, tpn, applePayFelids) {
  try {
    if (!applePayTransactionInfo) {
      console.error("Missing required attributes for Apple Pay integration.");
      return;
    }

    // Store applePayTransactionInfo globally
    window.applePayTransactionInfo = applePayTransactionInfo;

    // Load Apple Pay SDK if not already loaded
    if (
      !document.querySelector(
        'script[src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"]'
      )
    ) {
      const script = document.createElement("script");
      script.src =
        "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js";
      script.crossOrigin = "anonymous";

      script.onload = function () {
        console.log("Apple Pay SDK loaded successfully.");
        createApplePayButton();
      };

      script.onerror = function () {
        console.error("Failed to load Apple Pay SDK.");
      };

      document.head.appendChild(script);
    } else {
      createApplePayButton();
    }
  } catch (error) {
    console.error("Error initializing Apple Pay:", error);
  }

  window.createApplePayButton = function () {
    const container = document.getElementById("ipospays-apple-pay-button");

    if (!container) {
      console.error("Container element #ipospays-apple-pay-button not found.");
      return;
    }

    if (document.getElementById("apple-pay-button")) {
      console.warn("Apple Pay button already exists. Skipping creation.");
      return;
    }

    const applePayButton = document.createElement("apple-pay-button");
    applePayButton.id = "apple-pay-button";
    applePayButton.setAttribute(
      "buttonstyle",
      buttonStyles?.buttonColor || "black"
    );
    applePayButton.setAttribute("type", buttonStyles?.buttonType || "plain");
    applePayButton.setAttribute(
      "locale",
      buttonStyles?.buttonLocale || "en-US"
    );

    // Apply dynamic styles
    applePayButton.style.setProperty(
      "--apple-pay-button-width",
      buttonStyles?.buttonWidth || "150px"
    );
    applePayButton.style.setProperty(
      "--apple-pay-button-height",
      buttonStyles?.buttonHeight || "30px"
    );
    applePayButton.style.setProperty(
      "--apple-pay-button-border-radius",
      buttonStyles?.buttonRadius || "3px"
    );
    applePayButton.style.display = "block";

    applePayButton.addEventListener("click", startApplePayPayment);
    // Append the button inside the specified container
    container.appendChild(applePayButton);
    console.log("Apple Pay button created successfully.");

    // ✅ Emit event when Apple Pay button is fully loaded
    window.dispatchEvent(
      new CustomEvent("applePay:loaded", {
        detail: { message: "Apple Pay button is fully loaded" },
      })
    );
  }

  async function startApplePayPayment() {
    console.log("Starting Apple Pay transaction...");

    // ✅ Emit event when payment starts
    window.dispatchEvent(
      new CustomEvent("applePay:click", {
        detail: { message: "Apple Pay Clicked" },
      })
    );

    if (!window.ApplePaySession) {
      alert("Apple Pay is not supported on this device/browser.");
      console.error("Apple Pay is not available.");
      return;
    }

    const paymentMethodData = [
      {
        supportedMethods: "https://apple.com/apple-pay",
        data: {
          version: 14,
          merchantIdentifier: "platformintegrator.com.ipospays.payment",
          merchantCapabilities: ["supports3DS"],
          supportedNetworks: ["amex", "discover", "masterCard", "visa"],
          requiredBillingContactFields: ["postalAddress"],
          countryCode: window.applePayTransactionInfo.countryCode || "US",
        },
      },
    ];

    const paymentDetails = {
      total: {
        label: window.applePayTransactionInfo.totalPriceLabel || "Total",
        amount: {
          value: window.applePayTransactionInfo.totalPrice || "0.00",
          currency: window.applePayTransactionInfo.currencyCode || "USD",
        },
      },
    };

    const paymentOptions = {
      requestPayerName: applePayFelids?.requestPayerName || false,
      requestBillingAddress: applePayFelids?.requestBillingAddress || false,
      requestPayerEmail: applePayFelids?.requestPayerEmail || false,
      requestPayerPhone: applePayFelids?.requestPayerPhone || false,
      requestShipping: applePayFelids?.requestShipping || false,
      shippingType: "shipping",
    };

    const request = new PaymentRequest(
      paymentMethodData,
      paymentDetails,
      paymentOptions
    );

    // Merchant validation
    request.onmerchantvalidation = async (event) => {
      try {
        const merchantSession = await validateMerchant(event.validationURL);
        if (merchantSession) {
          event.complete(merchantSession);
          await returnPaymentMerchantSession(merchantSession);
        }
      } catch (error) {
        console.error("Merchant validation failed:", error);
        event.complete(null);
      }
    };

    request.onshippingoptionchange = (event) => {
      event.updateWith({
        total: paymentDetails.total,
      });
    };

    request.onshippingaddresschange = (event) => {
      event.updateWith({});
    };

    try {
      const paymentResponse = await request.show();
      // const paymentSuccess = await processPayment(paymentResponse);
      if (paymentResponse) {
        await paymentResponse.complete("success");
        console.log("Payment response received:", paymentResponse);
        await returnPaymentInfo(paymentResponse);
      } else {
        await paymentResponse.complete("fail");
        console.error("Payment response failed:", paymentResponse);
        await returnPaymentInfo(paymentResponse);
      }
    } catch (error) {
      console.error("Payment request failed:", error);
      await returnPaymentInfo(error);
    }
  }

  async function validateMerchant(validationURL) {
    try {
      console.log("Sending merchant validation request...");
      const response = await fetch(
        "https://payment.ipospays.com/api/v1/applepay/validate-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ftd-origin": applePayCurrentOrigin,
            "tpn": tpn,
            "hostName": applePayCurrentOrigin,
            "token" : "CeJIzu6zVi+klhMYgcreRz9Q3GEK/JAkcLMxmFepJw4=",
          },
          body: JSON.stringify({ validationURL }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to validate merchant session. HTTP Status: ${response.status}`
        );
      }

      const merchantSession = await response.json();
      console.log("Merchant validation response:", merchantSession);
      return merchantSession;
    } catch (error) {
      console.error("Error validating merchant:", error);
      throw error;
    }
  }

  async function returnPaymentMerchantSession(resPaymentMerchantSessionData) {
    if (window.getApplePaymentMerchantSession) {
      window.getApplePaymentMerchantSession(resPaymentMerchantSessionData);
    }
  }

  async function returnPaymentInfo(resPaymentInfoData) {
    if (window.getApplePaymentInfo) {
      window.getApplePaymentInfo(resPaymentInfoData);
    } else {
      console.error("getApplePaymentInfo function not defined in HTML.");
    }
  }
}

function updateApplePrice(newPrice) {
  if (!newPrice || isNaN(newPrice)) {
    console.error("Invalid price input.");
    return;
  }

  if (!window.applePayTransactionInfo) {
    console.error("applePayTransactionInfo is not defined.");
    return;
  }

  window.applePayTransactionInfo.totalPrice = newPrice;
  console.log("Updated Price:", window.applePayTransactionInfo.totalPrice);

  // Remove old Apple Pay button and create a new one
  const container = document.getElementById("ipospays-apple-pay-button");
  if (container) container.innerHTML = "";

  // Reinitialize the Apple Pay button
  if (window.createApplePayButton) {
    window.createApplePayButton();
  } else {
    console.error("createApplePayButton function not found.");
  }
}