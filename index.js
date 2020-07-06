// @ts-check
/**
 * Contains types of campaigns
 *
 * All types should have a meaningful "name" property and a brief "description" property
 *
 * Each type may have "requirement" function that calculates if the user can receive the rewards
 * If humans are needed (to answer a question), the "question" attribute should be specified
 *
 * Parameters to the requirement function: values (from database, valueDescriptions property should describe these values),
 * user, purchase, customerData (of the current business)
 *
 * @type {import("./index")}
 */
module.exports = {
    basicCampaign: {
        name: 'Basic Campaign',
        description: 'Default campaign type without any special functionality.'
    },
    isPurchaseGreaterThan: {
        name: 'Purchase Price',
        description: 'If the total cost of the purchase is greater than X',
        // We don't know the price so ask a human
        // {0} is the value parameter
        question: "Is the price of the purchase more than {0}?",
        valueDescriptions: [{
            name: 'Purchase amount',
            type: "number"
        }]
    },
    isBirthday: {
        name: 'Customer Birthday',
        description: "If it's the customer's birthday!",
        requirement: function ({ user }) {
            const { birthday: bd } = user
            if (bd) {
                const now = new Date()
                return bd.getMonth() === now.getMonth() && bd.getDate() === now.getDate()
            }
            return false
        },
    },
    stamps: {
        name: 'Stamp card',
        description: "Scan the user's QR code every time they make a purchase. After X scans they earn the reward.",
        valueDescriptions: [{
            name: 'Stamps to earn the reward',
            type: 5,
        }],
        requirement: function ({ values, customerData, purchase, campaign }) {
            const maxStamps = parseInt(values[0], 10)
            if (!maxStamps || !purchase) {
                return false
            }
            const duringCampaign = (date) => date > campaign.start && (!campaign.end || date < campaign.end)
            const currentStamps = customerData.purchases.filter(purchase => duringCampaign(purchase.createdAt))
            return currentStamps.length + 1 === maxStamps
        }
    }

}