export const enLocal = {
    en: {
        translation: {
            newChat: {
                free: 'Free',
                pro: 'Pro',
                max: 'Max',
                plan: "plan",
                upgrade: "Upgrade",
                listeningPlaceholder: "Listening...",
                defaultPlaceholder: "What can I do for you?",
                cancel: "Cancel",
                suggestions: [
                    "Summarize a topic for me",
                    "Help me write something",
                    "Explain a concept simply",
                    "Review my code",
                    "Brainstorm ideas with me",
                    "Help me make a decision",
                ]
            },
            chat: {
                untitled: "Untitled Chat",
                sessionLimitReached: "Current session reached it's limit",
                sessionUsage: "{{usedSession}}% of used session",
                upgrade: "Upgrade →",
                listeningPlaceholder: "Listening...",
                replyPlaceholder: "Reply...",
                cancel: "Cancel",
                sendHint: "Enter to send · Shift + Enter for new line"
            },
            recents: {
                title: "Chats",
                newChat: "New chat",
                searchPlaceholder: "Search chats...",
                today: "Today",
                yesterday: "Yesterday",
                lastWeek: "Last 7 days",
                older: "Older"
            },
            settings: {
                title: "Settings",
                general: "General",
                profile: "Profile",
                fullName: "Full name",
                displayName: "What should Selene call you?",
                workFunction: "What best describes your work?",
                workFunctionSelect: "Select your work function",
                preferences: "What personal preferences should Selene consider in responses?",
                preferencesNote: "Your preferences will apply to all conversations, within Selene's guidelines.",
                preferencesPlaceholder: "e.g. I primarily code in Python (not a coding beginner)",
                cancel: "Cancel",
                saveChanges: "Save changes",
                appearance: "Appearance",
                colorMode: "Color mode",
                light: "Light",
                auto: "Auto",
                dark: "Dark",
                billing: "Billing",
                account: 'Account',
                workFunctions: {
                    engineering: "Engineering",
                    productManagement: "Product Management",
                    design: "Design",
                    marketing: "Marketing",
                    sales: "Sales",
                    research: "Research",
                    education: "Education",
                    other: "Other"
                }
            },
            settingsBilling: {
                currentPlan: "Current plan",
                upgradeButton: "Upgrade plan",
                usageLimitsFree: "* Usage limits apply. See our pricing page for details.",
                usageLimitsPro: "* Usage limits apply. Pro includes 5x more usage than Free.",
                usageLimitsMax: "* Max plan includes priority access during high traffic times.",
                billingCycle: "Billing cycle",
                billingCycleValue: "Monthly",
                nextBillingDate: "Next billing date",
                amount: "Amount",
                manageSubscription: "Manage subscription",
                usageTier: "Usage tier",
                paymentMethod: "Payment method",
                updatePaymentMethod: "Update",
                billingHistory: "Billing history",
                invoiceStatusPaid: "Paid",
                downloadInvoice: "Download invoice",
                plan: 'plan',
                expires: 'Expires',
                usage: 'usage'
            },
            settingsAccount: {
                seleneCode: {
                    title: "Selene Code",
                    descriptionPaid: "Command-line tool for agentic coding. Delegate coding tasks directly from your terminal.",
                    descriptionFree: "Upgrade to Pro or Max to access Selene Code and delegate coding tasks from your terminal.",
                    downloadButton: "Download Selene Code",
                    upgradeButton: "Upgrade to unlock",
                    installationTitle: "Installation",
                    installationInstruction1: 'After downloading, run ',
                    installationInstruction2: "in your terminal to set up the CLI tool."
                },
                deleteAccount: {
                    title: "Delete your account",
                    button: "Delete account",
                    confirmTitle: "Delete Account?",
                    confirmDescription: "This will permanently delete your account, all conversations, and settings. You cannot undo this action.",
                    cancel: "Cancel",
                    confirmDelete: "Yes, Delete My Account"
                }
            },
            upgrade: {
                title: "Plans that grow with you",
                monthly: "Monthly",
                yearly: "Yearly ",
                yearlySave: "· Save 17%",
                usageNote: "*Usage limits apply. Prices shown don't include applicable tax."
            },
            sidebar: {
                close: "Close",
                open: "Open",
                closeSidebarTip: "Close sidebar",
                openSidebarTip: "Open sidebar",
                billing: "Billing",
                recents: "Recents",
                recentsTip: "Recents",
                newConversation: "New Conversation",
                hide: "Hide",
                show: "Show",
                empty: "Your conversations will appear here.",
                starred: 'Starred'
            },
            userDropdown: {
                logout: 'Log out'
            },
            upgradePro: {
                title: "Upgrade to Pro",
                description: "Research, code, and organize with extended capabilities",
                selectBillingCycle: "Select billing cycle",
                monthly: "Monthly",
                yearly: "Yearly",
                yearlySave: "Save 17%",
                yearlySubtext: "{{price}}/month, billed annually",
                monthlySubtext: "{{price}}/month",
                includedTitle: "What's included in Pro:",
                features: [
                    "5x more usage than Free",
                    "Access to Selene Code",
                    "Unlimited projects",
                    "Access to Research",
                    "Memory across conversations",
                    "Priority support",
                    "Selene in Excel and Chrome"
                ],
                orderSummary: "Order summary",
                proPlan: "Pro plan ({{billingCycle}})",
                tax: "Tax (17%)",
                annualDiscount: "Annual discount (17%)",
                monthlyTotal: "Monthly total",
                dueToday: "Due today",
                billedAnnually: "Billed annually",
                paymentMethod: "Payment method",
                fullName: "Full name",
                emailAddress: "Email address",
                fullNamePlaceholder: "John Doe",
                emailPlaceholder: "john.doe@example.com",
                cardNumber: "Card number",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDate: "Expiry date",
                expiryDatePlaceholder: "MM/YY",
                cvc: "CVC",
                cvcPlaceholder: "123",
                country: "Country",
                countries: {
                    US: "United States",
                    UK: "United Kingdom",
                    CA: "Canada",
                    AU: "Australia",
                    DE: "Germany",
                    FR: "France",
                    other: "Other"
                },
                zipCode: "ZIP code",
                zipCodePlaceholder: "12345",
                secureNote: "Your payment information is encrypted and secure. We never store your full card details.",
                processing: "Processing...",
                purchaseTitle: 'Purchase Pro - ',
                byPurchase: 'By purchasing, you agree to our',
                terms: "Terms of Service",
                and: 'and',
                privacy: "Privacy Policy",
                renewAnnually: " Your subscription will renew annually.",
                errors: {
                    fullNameRequired: "Full name is required",
                    fullNameMinLength: "Name must be at least 3 characters",
                    fullNameLettersOnly: "Name can only contain letters",

                    emailRequired: "Email is required",
                    emailInvalid: "Please enter a valid email address",

                    cardNumberRequired: "Card number is required",
                    cardNumberLength: "Card number must be 16 digits",
                    cardNumberDigitsOnly: "Card number must contain only digits",
                    cardNumberInvalid: "Invalid card number",

                    expiryDateRequired: "Expiry date is required",
                    expiryDateFormat: "Format must be MM/YY",
                    expiryDateMonthInvalid: "Invalid month",
                    expiryDateExpired: "Card has expired",

                    cvcRequired: "CVC is required",
                    cvcInvalid: "CVC must be 3-4 digits",

                    zipRequired: "ZIP code is required",
                    zipInvalid: "Invalid ZIP code format"
                }
            },
            upgradeMax: {
                title: "Upgrade to Max",
                description: "Research, code, and organize with extended capabilities",
                selectUsage: "Select usage",
                usageOptions: {
                    fiveX: "5x more usage than Pro",
                    twentyX: "20x more usage than Pro"
                },
                save50: "Save 50%",
                includedTitle: "What's included in Max:",
                features: [
                    "Choose 5x or 20x more usage than Pro*",
                    "Higher output limits for all tasks",
                    "Early access to advanced Selene features",
                    "Priority access at high traffic times",
                    "Selene in PowerPoint"
                ],
                orderSummary: "Order summary",
                maxPlan: "Max plan ({{usage}})",
                tax: "Tax (17%)",
                annualDiscount: "Annual discount (50%)",
                monthlyTotal: "Monthly total",
                billedAnnually: "Billed annually",
                paymentMethod: "Payment method",
                fullName: "Full name",
                emailAddress: "Email address",
                fullNamePlaceholder: "John Doe",
                emailPlaceholder: "john.doe@example.com",
                cardNumber: "Card number",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDate: "Expiry date",
                expiryDatePlaceholder: "MM/YY",
                cvc: "CVC",
                cvcPlaceholder: "123",
                country: "Country",
                countries: {
                    US: "United States",
                    UK: "United Kingdom",
                    CA: "Canada",
                    AU: "Australia",
                    DE: "Germany",
                    FR: "France",
                    other: "Other"
                },
                zipCode: "ZIP code",
                zipCodePlaceholder: "12345",
                secureNote: "Your payment information is encrypted and secure. We never store your full card details.",
                processing: "Processing...",
                purchaseTitle: "Purchase Max - ",
                terms: "Terms of Service",
                privacy: "Privacy Policy",
                renewAnnually: "Your subscription will renew annually."
            },
            supportChat: {
                header: {
                    title: "Selene Support",
                    status: "Ready to answer."
                },
                tabs: {
                    chat: "Chat",
                    faq: "FAQ"
                },
                messages: {
                    success: "Thanks for reaching out! Our support team will get back to you shortly. In the meantime, you can check our Help Center for quick answers.",
                    error: "Sorry, something went wrong, please try again later..."
                },
                close: "Close",
                faq: {
                    title: "Frequently Asked Questions",
                    subtitle: "Find quick answers to common questions",
                    stillHaveQuestions: "Still have questions?",
                    chatWithSupport: "Chat with support"
                },
                faqQuestions: [
                    {
                        question: "How do I upgrade to Pro?",
                        answer: "You can upgrade to Pro by clicking the 'Upgrade' button in the dropdown menu or visiting the pricing page. Pro includes 5x more usage, access to Selene Code, unlimited projects, and more advanced features.",
                    },
                    {
                        question: "What payment methods do you accept?",
                        answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through our encrypted payment gateway.",
                    },
                    {
                        question: "Can I cancel my subscription anytime?",
                        answer: "Yes! You can cancel your subscription at any time from your account settings. If you cancel, you'll retain access to Pro features until the end of your billing period.",
                    },
                    {
                        question: "How does the usage limit work?",
                        answer: "Free plan has basic usage limits. Pro plan offers 5x more usage than Free. Usage resets at the beginning of each billing period. You can track your usage in the dashboard.",
                    },
                    {
                        question: "What's included in the Pro plan?",
                        answer: "Pro includes: 5x more usage, Selene Code access, Cowork for file management, unlimited projects, Research feature, memory across conversations, priority support, and Selene integrations with Excel and Chrome.",
                    },
                    {
                        question: "Do you offer refunds?",
                        answer: "We offer a 14-day money-back guarantee for new Pro subscribers. If you're not satisfied within the first 14 days, contact our support team for a full refund.",
                    },
                    {
                        question: "Is my data secure?",
                        answer: "Yes! We use industry-standard encryption for all data transmission and storage. Your payment information is never stored on our servers. We're fully compliant with GDPR and other privacy regulations.",
                    },
                ],
                quickActions: [
                    "Billing",
                    "Account",
                    "Technical"
                ],
                input: {
                    needHelpWith: 'I need help with',
                    placeholder: "Type your message...",
                    send: "Send"
                },
                replyTime: "We typically reply within a few minutes"
            },
            chatDropdown: {
                rename: "Rename",
                star: "Star",
                unstar: "Unstar",
                delete: "Delete chat",
                renamePlaceholder: "Enter new name..."
            },
            messageBubble: {
                states: {
                    thinking: "Thinking",
                    working: "Working",
                    done: "Done"
                },
                badges: {
                    thoughtForMoment: "Thought for a moment",
                    thoughtForSeconds: "Thought for {{seconds}}s"
                },
                details: {
                    thinkingTitle: "Thinking",
                    thinkingDescription: "Analyzed your request and planned the response structure",
                    workingTitle: "Working",
                    workingDescription: "Generated response with relevant information",
                    doneTitle: "Done",
                    doneDescription: "Response completed and ready"
                },
                editing: {
                    warning: "Editing this message will erase previous written message, so be sure to understand consequences.",
                    cancel: "Cancel",
                    save: "Save"
                },
                retry: {
                    title: "Retry",
                    message: "Something went wrong, wanna try again?"
                },
                actions: {
                    copy: "Copy",
                    edit: "Edit",
                    like: "Give positive feedback",
                    dislike: "Give negative feedback"
                },
                copied: "Copied",
                timestamp: "Sent at {{time}}",
                saving: "Saving",
                saved: "Saved"
            },
            messageFeedback: {
                title: {
                    positive: "Give positive feedback",
                    negative: "Give negative feedback"
                },
                negativeIssueLabel: "What type of issue do you wish to report? (optional)",
                negativeIssueSelect: "Select...",
                detailsLabel: "Please provide details: (optional)",
                detailsPlaceholder: {
                    positive: "What was satisfying about this response?",
                    negative: "What was unsatisfying about this response?"
                },
                note: "Submitting this report will send the entire current conversation to Selene Company for future improvements to our models.",
                learnMore: "Learn More",
                buttons: {
                    submit: "Submit",
                    submitting: "Submitting...",
                    cancel: "Cancel"
                },
                negativeIssues: [
                    "UI bug",
                    "Overactive refusal",
                    "Poor image understanding",
                    "Did not fully follow my request",
                    "Not factually correct",
                    "Incomplete response",
                    "Should have searched the web",
                    "Report content",
                    "Not in keeping with Selene's Constitution",
                    "Other",
                ]
            }
        }
    }
}