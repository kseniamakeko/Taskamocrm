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
        "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImU3OTIwZTkwYWQ3NzRmMjM1ZWNmMTg4MWIyYTg2NmZiYTUyNWNiNWRhYWM5MmUxMWJkMjU4YTg5MWM1M2VhMWIxNGQwNmI0MjMxZTE5MGNmIn0.eyJhdWQiOiIxYzE1MTFkNS1hM2Y1LTQ4OWEtYjBjZS1mMjMxNDNlOTI5YTAiLCJqdGkiOiJlNzkyMGU5MGFkNzc0ZjIzNWVjZjE4ODFiMmE4NjZmYmE1MjVjYjVkYWFjOTJlMTFiZDI1OGE4OTFjNTNlYTFiMTRkMDZiNDIzMWUxOTBjZiIsImlhdCI6MTcxMDY5MTMyNSwibmJmIjoxNzEwNjkxMzI1LCJleHAiOjE3MTA3Nzc3MjUsInN1YiI6IjEwNzk2OTYyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNjMwMTM4LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMWRmOGYxMjctOWIyZi00NTg4LThhNTctYzA4NWVjMjJiZGRhIn0.n4g-yrqk3cuqZmOioUS4lJ7V7DRZMuVWJl31hxt4g6LdVLm-rNwCX0oYC1GFGSXfcLseUBAe8IFK2F_IbtA3wl_QXKKY1M50IuSou2VBB1nd0i7cbVHjN-np4ufX_tgCyPG-YSWlfvLDIxzIolir-otfxkHYPmVNlyEBDg591s1ixEufvhpKGDPN6_4Q5RRQ52w3yQU9C2caOrfcPFTGCMhe8hjMi4ZTcPwj11Ury21bS3srIjV_wLuUmgtLB3FUFB4uXRiFbNjpUPR_PUO4gLzXuX1D8AudGUTXvCUTBYCLRjg5XoDeT1VIU51acYuzZ7OqaSpWhL_xiizQPD8gqg"
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

document.addEventListener("DOMContentLoaded", async () => {
  const clientLeads = [];
  const limit = 2;
  let leadsCountResponse = limit;
  let requestCount = 0;
  let page = 1;
  const delayFunction = function delay() {
    console.log("delay");
  };

  while (leadsCountResponse === limit) {
    const intervalID = setInterval(() => {
      if ((requestCount % 3 === 0) & (leadsCountResponse === limit)) {
        setTimeout(delayFunction, 1000);
      } else {
        if (requestCount < limit) {
          fetchLeads(limit, page);
        } else {
          clearInterval(intervalID);
          console.log("Max requests reached");
        }
      }
    }, 1000);

    const leads = await fetchLeads(limit, page);

    for (let i = 0; i < leads.length; i++) {
      clientLeads.push(leads[i]);
    }
    leadsCountResponse = leads.length;
    requestCount++;
    console.log(clientLeads);
    page++;
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

  fetchAndPopulateLeads("name");
});

//   if (i % 3 === 0) {
//     // timeout
//   } else {
//     // amocrm request
//   }
// }
