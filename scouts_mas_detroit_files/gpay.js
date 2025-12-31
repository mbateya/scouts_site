function initializeGooglePay(transactionInfo, googlePayMerchantId, googlePayMode, buttonStyles, googlePayFelids) {
  if (!transactionInfo || !googlePayMerchantId || !googlePayMode) {
    console.error("Missing required attributes for Google Pay integration.");
    return;
  }
  // Store transactionInfo globally to avoid scope issues
  window.transactionInfo = transactionInfo;

  const script = document.createElement("script");
  script.src = "https://pay.google.com/gp/p/js/pay.js";
  script.async = true;

  script.onload = () => {
    onGooglePayLoaded();
  };

  document.head.appendChild(script);

  let paymentsClient = null;
  const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];

  function onGooglePayLoaded() {
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient
      .isReadyToPay(getGoogleIsReadyToPayRequest())
      .then((response) => {
        if (response.result) {
          addGooglePayButton();
        }
      })
      .catch((err) => {
        console.error("Error checking Google Pay readiness: ", err);
      });
  }

  function getGooglePaymentsClient() {
    if (paymentsClient === null) {
      paymentsClient = new google.payments.api.PaymentsClient({
        environment: googlePayMode || "TEST",
      });
    }
    return paymentsClient;
  }

  function getGoogleIsReadyToPayRequest() {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: allowedCardNetworks,
          },
        },
      ],
    };
  }

  // Make `addGooglePayButton` globally accessible
  window.addGooglePayButton = function () {
    const paymentsClient = getGooglePaymentsClient();
    const button = paymentsClient.createButton({
      buttonColor: buttonStyles?.buttonColor || "default",
      buttonType: buttonStyles?.buttonType || "plain",
      buttonRadius: buttonStyles?.buttonRadius || 4,
      buttonLocale: buttonStyles?.buttonLocale || "en",
      buttonSizeMode: buttonStyles?.buttonHeight || buttonStyles?.buttonWidth ? "fill" : "",
      onClick: onGooglePaymentButtonClicked,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: allowedCardNetworks,
          },
        },
      ],
    });
  
    let container = document.getElementById("ipospays-gpay-btn");
    if (!container) {
      container = document.createElement("div");
      container.id = "ipospays-gpay-btn";
      document.body.appendChild(container);
    } else {
      container.innerHTML = ""; // Clear previous button
    }
  
    // Apply button styles
    if (buttonStyles?.buttonHeight) {
      container.style.height = buttonStyles.buttonHeight;
    }
    if (buttonStyles?.buttonWidth) {
      container.style.width = buttonStyles.buttonWidth;
    }
  
    container.appendChild(button);

    // Emit an event when the button is fully loaded
    window.dispatchEvent(
      new CustomEvent("googlePay:loaded", {
        detail: { message: "Google Pay button is fully loaded" },
      })
    );
  };
  
  function onGooglePaymentButtonClicked() {
    window.dispatchEvent(
      new CustomEvent("googlePay:click", {
        detail: { message: "Google Pay button clicked" },
      })
    );
    const paymentDataRequest = getGooglePaymentDataRequest();
    const paymentsClient = getGooglePaymentsClient();
      paymentsClient
        .loadPaymentData(paymentDataRequest)
        .then((paymentData) => {
          returnPaymentTokenToHTML(paymentData);
        })
        .catch((err) => {
          console.error("Error loading payment data: ", err);
        });
  }

  function getGooglePaymentDataRequest() {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: allowedCardNetworks,
            // billingAddressRequired: googlePayFelids?.requestBillingAddress || false,
            billingAddressRequired: true,
            billingAddressParameters: {
              format: "FULL",
              phoneNumberRequired: googlePayFelids?.requestPayerPhone || false,
            },
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "denovosystempay",
              gatewayMerchantId: "BCR2DN4TW6UK72QT",
            },
          },
        },
      ],
      transactionInfo: window.transactionInfo,
      merchantInfo: {
        merchantId: googlePayMerchantId,
        merchantName: "",
      },
      emailRequired: googlePayFelids?.requestPayerEmail || false,
      shippingAddressRequired: googlePayFelids?.requestShipping || false,
    };
  }

  function returnPaymentTokenToHTML(paymentData) {
    if (window.getPaymentInfo) {
      window.getPaymentInfo(paymentData);
    } else {
      console.error("getPaymentInfo function not defined in HTML.");
    }

    if (window.getPaymentToken) {
      window.getPaymentToken(JSON.stringify(paymentData?.paymentMethodData?.tokenizationData?.token));
    }
  }
}

// Fix `updatePrice` function to correctly update the price
function updatePrice(newPrice) {
  if (!newPrice || isNaN(newPrice)) {
    console.error("Invalid price input.");
    return;
  }

  if (!window.transactionInfo) {
    console.error("transactionInfo is not defined.");
    return;
  }

  window.transactionInfo.totalPrice = newPrice;
  console.log("Updated Price:", window.transactionInfo.totalPrice);

  // Remove old Google Pay button and add a new one
  const container = document.getElementById("ipospays-gpay-btn");
  if (container) container.innerHTML = "";

  // Reinitialize the Google Pay button
  if (window.addGooglePayButton) {
    window.addGooglePayButton();
  } else {
    console.error("addGooglePayButton function not found.");
  }
}