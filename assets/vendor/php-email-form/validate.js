/**
* Email Form Logic for Lambda/API Gateway Submission
* Modified from original PHP Email Form Validation v3.10 (BootstrapMade.com)
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form'); 

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault(); // Previene el envío normal del formulario

      let thisForm = this;

      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key'); // Mantenemos la lógica reCAPTCHA por si acaso

      // --- Muestra estado 'Loading', oculta otros mensajes ---
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      // --- Crear objeto JS con los datos del formulario ---
      let formElements = thisForm.elements;
      let dataToSend = {};
      try {
        // Intenta acceder a los elementos por nombre o id
        dataToSend = {
            name: formElements.name ? formElements.name.value.trim() : (formElements['name-field'] ? formElements['name-field'].value.trim() : ''),
            email: formElements.email ? formElements.email.value.trim() : (formElements['email-field'] ? formElements['email-field'].value.trim() : ''),
            subject: formElements.subject ? formElements.subject.value.trim() : (formElements['subject-field'] ? formElements['subject-field'].value.trim() : ''),
            message: formElements.message ? formElements.message.value.trim() : (formElements['message-field'] ? formElements['message-field'].value.trim() : '')
        };
         // Validación simple
        if (!dataToSend.name || !dataToSend.email || !dataToSend.subject || !dataToSend.message) {
            displayError(thisForm, 'Please fill in all required fields.');
            return;
        }
      } catch (error) {
          console.error("Error accessing form elements:", error);
          displayError(thisForm, 'Could not read form data.');
          return;
      }
      // --- Fin Crear objeto JS ---


      // --- Lógica reCAPTCHA (Opcional, quitar si no se usa) ---
      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              // La acción aquí es solo una etiqueta para reCAPTCHA, no afecta el envío
              grecaptcha.execute(recaptcha, {action: 'contact_form_submit'})
              .then(token => {
                // dataToSend['g-recaptcha-response'] = token;
                console.log("reCAPTCHA token generated, sending form to Lambda.");
                submit_to_lambda(thisForm, dataToSend); // Llama a la función para enviar a Lambda
              })
              .catch(recaptchaError => { // Captura errores de la promesa de reCAPTCHA
                 console.error("reCAPTCHA execution error:", recaptchaError);
                 displayError(thisForm, 'reCAPTCHA validation failed.');
              });
            } catch(error) {
              console.error("reCAPTCHA setup error:", error);
              displayError(thisForm, 'Error initializing reCAPTCHA.');
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!');
        }
      } else {
        // --- Fin Lógica reCAPTCHA ---

        // Llama directamente a la función de envío si no hay reCAPTCHA
        submit_to_lambda(thisForm, dataToSend);
      }
    });
  });

  /**
   * Envía los datos del formulario como JSON a la API Gateway/Lambda.
   * @param {HTMLFormElement} thisForm - El elemento del formulario.
   * @param {object} formDataObject - El objeto JavaScript con los datos del formulario.
   */
  function submit_to_lambda(thisForm, formDataObject) {
    const apiUrl = 'URL_DE_TU_API_GATEWAY_ENDPOINT/contact';
    // Ejemplo: const apiUrl = 'https://a1b2c3d4e5.execute-api.us-east-1.amazonaws.com/contact';

    let loading = thisForm.querySelector('.loading');
    let errorMessage = thisForm.querySelector('.error-message');
    let sentMessage = thisForm.querySelector('.sent-message');

    fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(formDataObject), // Convierte el objeto JS a JSON
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      // Verifica si la respuesta HTTP fue exitosa (status 200-299)
      if (response.ok) {
        return response.json().catch(() => ({})); // Intenta parsear JSON, devuelve {} si no hay cuerpo o no es JSON
      } else {
        // Intenta obtener un mensaje de error del cuerpo JSON, si no, usa el statusText
        return response.json()
          .catch(() => ({})) // Intenta parsear el error JSON, devuelve {} si falla
          .then(errData => {
             // Lanza un error para que lo capture el .catch() de abajo
             // Usa el mensaje del error JSON si existe, si no, usa el estado HTTP
             throw new Error(errData.message || `Error: ${response.status} ${response.statusText}`);
          });
      }
    })
    .then(data => {
      // Éxito en el envío y respuesta OK del backend
      loading.classList.remove('d-block');
      errorMessage.classList.remove('d-block'); // Oculta cualquier error previo
      sentMessage.classList.add('d-block');
      thisForm.reset(); // Limpia el formulario
      console.log('Success data from Lambda:', data);
    })
    .catch((error) => {
      // Error durante el fetch o por respuesta no-OK del backend
      console.error("Fetch error:", error);
      displayError(thisForm, error.message || 'An unexpected error occurred. Please try again.');
    });
  }

  /**
   * Muestra un mensaje de error en el formulario.
   * (Función original del script, se mantiene igual)
   * @param {HTMLFormElement} thisForm
   * @param {string} error
   */
  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error; // Muestra el error
    thisForm.querySelector('.error-message').classList.add('d-block');
    thisForm.querySelector('.sent-message').classList.remove('d-block'); // Asegúrate de ocultar el mensaje de éxito
  }

})();