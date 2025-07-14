// Add this test function to your Google Apps Script to verify it's working

function testDoPost() {
  // Create test data that matches the structure from your HTML form
  const testData = {
    week: "50",
    date: "December 13, 2024",
    sales: [
      {
        status: "closed",
        description: "Test Hotel Bangkok",
        zones: "10",
        yearly: "50000",
        currency: "THB",
        member: "Nikki"
      }
    ],
    music: [],
    tech: [],
    challenges: "Test challenge",
    priorities: "Test priority",
    metrics: {
      international: {
        closedZones: "0",
        closedAmount: "$0",
        pipelineZones: "0",
        pipelineAmount: "$0"
      },
      thailand: {
        closedZones: "10",
        closedAmount: "฿50,000",
        pipelineZones: "0",
        pipelineAmount: "฿0"
      }
    }
  };
  
  // Simulate the POST request
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  // Call the doPost function
  const result = doPost(e);
  
  // Log the result
  console.log(result.getContent());
}

// Run this function in the Apps Script editor to test