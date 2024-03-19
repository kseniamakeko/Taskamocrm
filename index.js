function parseAndFormatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day},${hours}:${minutes}`;
}

function fetchLeads(limit, page) {
  const apiUrl = `http://localhost:8080/testcrmnpm.amocrm.ru/api/v4/leads?page=${page}&limit=${limit}`;

  return fetch(apiUrl, {
    headers: {
      Authorization:
        "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjlhMDdlNTIzYWVmNzkxZDlkMWUzMDg3YTA5ZDEyZGNlMTI0NjNmZGZkNWE1NWIyOGViNjVlMDYzOTliNmU3N2IwZWEyYjBlOTZhZjgzYjQxIn0.eyJhdWQiOiIxYzE1MTFkNS1hM2Y1LTQ4OWEtYjBjZS1mMjMxNDNlOTI5YTAiLCJqdGkiOiI5YTA3ZTUyM2FlZjc5MWQ5ZDFlMzA4N2EwOWQxMmRjZTEyNDYzZmRmZDVhNTViMjhlYjY1ZTA2Mzk5YjZlNzdiMGVhMmIwZTk2YWY4M2I0MSIsImlhdCI6MTcxMDg1MDA5NCwibmJmIjoxNzEwODUwMDk0LCJleHAiOjE3MTA5MzY0OTQsInN1YiI6IjEwNzk2OTYyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNjMwMTM4LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiM2I2MGUzZjYtMTBiZS00ODE3LWIzOTEtYWM3NWJhZDUxNzY1In0.NQtF7rBnJXEf11g-RXj9Cx_K26uR0HzAygCVOlu5F9klvCj_OBN4uAm7KGCBRDi5KXNgYmvltezGKiA3BpBMcLIc2aHSAqg2FyvTBsWSl1d10TqqMYRh3uQXceMiIhx7p1JitoK5NyUDC6yJKpZ7EsuoL0B-PKDKzwDBloTrrAlz8vwqeQdGfym4cpBdqUP7bKYpw2NKRTkK2t0PwPQTe_8aA-QOzooTMlHNs5-ngUNOCnHzpWj7as5UsAGeZcauWVQDaFyhK3NMrVbr5ZiVziUTW_LKYk4PmkC8N9Tnsu_KMfu2N45TpyT3VUZYU-P2sMvH4iRgQzwaW8B04mwL2A"
    }
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(function (data) {
      return data._embedded.leads.slice(0, limit);
    })
    .catch(function (error) {
      console.error("Error fetching leads:", error);
      throw error;
    });
}

const dealay = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

document.addEventListener("DOMContentLoaded", async () => {
  const clientLeads = [];
  const limit = 2;
  let leadsCountResponse = limit;
  let index = 0;
  let page = 1;

  while (leadsCountResponse === limit) {
    if ((index + 1) % 3 === 0) {
      await dealay(1);
    } else {
      const leads = await fetchLeads(limit, page);

      for (let i = 0; i < leads.length; i++) {
        clientLeads.push(leads[i]);
      }

      leadsCountResponse = leads.length;
      page++;
    }

    index++;
  }

  const state = {
    limit: 100,
    sortBy: "name"
  };

  function sortLeadsByName(leads) {
    return leads.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  function sortLeadsByPrice(leads) {
    return leads.slice().sort((a, b) => a.price - b.price);
  }

  function fetchAndPopulateLeads() {
    fetchLeads(state.limit, 1)
      .then((leads) => {
        let sortedLeads;
        if (state.sortBy === "name") {
          sortedLeads = sortLeadsByName(leads);
        } else if (state.sortBy === "price") {
          sortedLeads = sortLeadsByPrice(leads);
        }
        populateTable(sortedLeads);
      })
      .catch((error) => {
        console.error("Error fetching leads:", error);
      });
  }

  document.querySelectorAll('input[name="sort"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      state.sortBy = this.value;
      fetchAndPopulateLeads();
    });
  });

  document.querySelector(".two-leads").addEventListener("click", function () {
    state.limit = 2;
    fetchAndPopulateLeads();
  });

  document.querySelector(".five-leads").addEventListener("click", function () {
    state.limit = 5;
    fetchAndPopulateLeads();
  });

  document.querySelector(".ten-leads").addEventListener("click", function () {
    state.limit = 10;
    fetchAndPopulateLeads();
  });

  document.querySelector(".all-leads").addEventListener("click", function () {
    state.limit = 100;
    fetchAndPopulateLeads();
  });

  function populateTable(leads) {
    const dealsTable = document.querySelector(".table");

    while (dealsTable.rows.length > 1) {
      dealsTable.deleteRow(1);
    }

    leads.forEach(function (lead) {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      nameCell.textContent = lead.name || "";
      row.appendChild(nameCell);

      const priceCell = document.createElement("td");
      priceCell.textContent = lead.price || "";
      row.appendChild(priceCell);

      const createdAtCell = document.createElement("td");
      createdAtCell.textContent = parseAndFormatDate(lead.created_at) || "";
      row.appendChild(createdAtCell);

      const responsibleCell = document.createElement("td");
      responsibleCell.textContent = lead.responsible_user_id || "";
      row.appendChild(responsibleCell);

      dealsTable.appendChild(row);
    });
  }

  // fetchAndPopulateLeads("name");
});

//   if (i % 3 === 0) {
//     // timeout
//   } else {
//     // amocrm request
//   }
// }
