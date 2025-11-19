/**
 * NOTE: The id selector or event listener not working.
 * might fix later...
 */

document.addEventListener("DOMContentLoaded", () => {
  // update seller by id
  const editSellerForm = document.getElementById('edit_seller_form');

  editSellerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log('saved');

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log('entries', data);

    try {
      const res = await fetch(`/api/sellers/${data.user_id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      console.log('response', res.ok);

      const result = await res.json();
      console.log(result)

      if (!res.ok && res.data.error) {
        console.log(res.data.error)
      }
      editSellerForm.reset();

      editSellerModal.style.display = "none";
    } catch {
      // document.getElementById("error_message").innerText = err.message;
      // document.getElementById("error_message").style.display = 'block';
      console.log("Network Error. Please try again.")
    }
  });



  // update seller by id
  const deleteSeller = document.getElementById('delete_seller_action');

  deleteSeller.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log('saved');

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log('entries', data);

    try {
      const res = await fetch(`/api/sellers/${data.user_id}`, {
        method: 'DELETE'
      });

      console.log('response', res.ok);

      const result = await res.json();
      console.log(result)

      if (!res.ok && res.data.error) {
        throw new Error(res.data.error);
      }


      deleteModal.style.display = "none";
    } catch (err) {
      console.log(err)
    }
  });
});