import { API_URL } from "../../app/utils/enum"

describe("Manifest Printing", () => {
    test('It should returns object of manifest', async () => {
        const response = await fetch(`http://localhost:3000/${API_URL.ADMIN}/manifest`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
            },
            body: JSON.stringify({
                
            })
        })
    })
})