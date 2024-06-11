window.onload = function() {
    // Fetch data from CSV
    fetch('data.csv')
        .then(response => response.text())
        .then(data => {
            // Process CSV data
            const parsedData = processData(data);

            // Now you can use parsedData to update your charts
            updateCharts(parsedData);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function processData(csvData) {
    // Split CSV data into rows
    const rows = csvData.trim().split('\n');
    // Get header
    const header = rows[0].split(',');

    // Parse each row into an object
    const data = rows.slice(1).map(row => {
        const values = row.split(',');
        const obj = {};
        header.forEach((key, i) => {
            obj[key.trim()] = values[i].trim();
        });
        return obj;
    });

    return data;
}

function updateCharts(data) {
    // Group data by year and gender
    const years = [...new Set(data.map(item => item.Year))];
    const genders = [...new Set(data.map(item => item.Customer_Gender))];
    
    const totalOrderQuantity = {};
    const totalRevenue = {};

    data.forEach(item => {
        const year = item.Year;
        const gender = item.Customer_Gender;
        const orderQuantity = parseInt(item.Total_Order_Quantity);
        const revenue = parseInt(item.Total_Revenue_bersih);

        if (!totalOrderQuantity[year]) {
            totalOrderQuantity[year] = { 'M': 0, 'F': 0 };
        }
        if (!totalRevenue[year]) {
            totalRevenue[year] = { 'M': 0, 'F': 0 };
        }

        totalOrderQuantity[year][gender] += orderQuantity;
        totalRevenue[year][gender] += revenue;
    });

    // Convert data to chart format
    const orderQuantityData = {
        labels: years,
        datasets: genders.map(gender => ({
            label: `Total Order Quantity (${gender})`,
            data: years.map(year => totalOrderQuantity[year][gender]),
            backgroundColor: gender === 'M' ? 'rgba(54, 162, 235, 0.2)' : 'rgba(255, 99, 132, 0.2)',
            borderColor: gender === 'M' ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }))
    };

    const revenueData = {
        labels: years,
        datasets: genders.map(gender => ({
            label: `Total Revenue (${gender})`,
            data: years.map(year => totalRevenue[year][gender]),
            backgroundColor: gender === 'M' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(153, 102, 255, 0.2)',
            borderColor: gender === 'M' ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }))
    };

    const polarData = {
        labels: genders,
        datasets: [{
            label: 'Total Revenue by Gender',
            data: genders.map(gender => data.filter(item => item.Customer_Gender === gender).reduce((sum, item) => sum + parseInt(item.Total_Revenue_bersih), 0)),
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1
        }]
    };

    // Create Chart 1: Bar Chart for Total Order Quantity
    const ctx1 = document.getElementById('myChart').getContext('2d');
    new Chart(ctx1, {
        type: 'bar',
        data: orderQuantityData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Create Chart 2: Line Chart for Total Revenue
    const ctx2 = document.getElementById('myChart2').getContext('2d');
    new Chart(ctx2, {
        type: 'line',
        data: revenueData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Create Chart 3: Polar Area Chart for Total Revenue by Gender
    const ctx3 = document.getElementById('myChart3').getContext('2d');
    new Chart(ctx3, {
        type: 'doughnut',
        data: polarData,
        options: {}
    });
}