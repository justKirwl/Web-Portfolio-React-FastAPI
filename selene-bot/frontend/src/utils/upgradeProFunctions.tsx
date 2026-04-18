import { useNavigate } from "react-router-dom";
import { useUpgradeProActions, useUpgradeProCardData, useUpgradeProErrors, useUpgradeProInfo, useUpgradeProTouched, type CardData } from "../stores/UpgradeProStore";
import { useCallback } from "react";
import { useTranslation } from "../../node_modules/react-i18next";

export default function useUpgradeProFunctions() {
    const formData = useUpgradeProCardData()
    const errors = useUpgradeProErrors()
    const touched = useUpgradeProTouched()

    const { billingCycle, isProcessing } = useUpgradeProInfo()
    const { setFormData, setErrors, setTouched, setIsProcessing, upgradePlan } = useUpgradeProActions()

    const { t } = useTranslation()
    
    const navigate = useNavigate();

    const { email, expiryDate, fullName, cardNumber, cvc, zipCode, country } = formData;

    const validateFullName = (name: string) => {
        if (name.length <= 0) {return t('upgradePro.errors.fullNameRequired')};
        if (name.length < 3) {return t('upgradePro.errors.fullNameMinLength')};
        if (!/^[a-zA-Z\s]+$/.test(name)) {return t('upgradePro.errors.fullNameLettersOnly')};
        return "";
    };
    
    const validateEmail = useCallback((email: string) => {
        if (!email.trim()) return t('upgradePro.errors.emailRequired');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return t('upgradePro.errors.emailInvalid');
        return "";
    }, [email]);

    const validateCardNumber = useCallback((num: string) => {
        const cleaned = num.replace(/\s/g, "");
        if (!cleaned) return t('upgradePro.errors.cardNumberRequired');
        if (cleaned.length !== 16) return t('upgradePro.errors.cardNumberLength');
        if (!/^\d+$/.test(cleaned)) return t('upgradePro.errors.cardNumberDigitsOnly');
        
        let sum = 0;
        let isEven = false;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i]);
            if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }

        if (sum % 10 !== 0) return t('upgradePro.errors.cardNumberInvalid');
        return "";
    }, [cardNumber]);

    const validateExpiryDate = useCallback((date: string) => {
        if (!date) return t('upgradePro.errors.expiryDateRequired');
        if (!/^\d{2}\/\d{2}$/.test(date)) return t('upgradePro.errors.expiryDateFormat');
        const [month, year] = date.split("/").map(Number);
        if (month < 1 || month > 12) return t('upgradePro.errors.expiryDateMonthInvalid');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return t('upgradePro.errors.expiryDateExpired');
        }
        return "";
    }, [expiryDate]);

    const validateCvc = useCallback((cvc: string) => {
        if (!cvc) return t('upgradePro.errors.cvcRequired');
        if (!/^\d{3,4}$/.test(cvc)) return t('upgradePro.errors.cvcInvalid');
        return "";
    }, [cvc]);

    const validateZipCode = useCallback((zip: string) => {
        if (!zip.trim()) return t('upgradePro.errors.zipRequired');
        if (!/^\d{5}(-\d{4})?$/.test(zip)) return t('upgradePro.errors.zipInvalid');
        return "";
    }, [zipCode]);

    const formatCardNumber = useCallback((value: string) => {
        const cleaned = value.replace(/\s/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        return formatted.slice(0, 19);
    }, [formData.cardNumber]);

    const formatExpiryDate = useCallback((value: string) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
        }
        return cleaned;
    }, [expiryDate]);

    const formatZipCode = useCallback((value: string) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length > 5) {
            return cleaned.slice(0, 5) + "-" + cleaned.slice(5, 9);
        }
        return cleaned;
    }, [zipCode]);

    function handleFieldChange<K extends keyof CardData>(field: K, value: string) {
        setFormData({ ...formData, [field]: value });
        
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleFieldBlur = useCallback((field: string) => {
        setTouched({ ...touched, [field]: true });

        let error = "";
        switch (field) {
            case "fullName":
            error = validateFullName(formData.fullName);
            break;
            case "email":
            error = validateEmail(formData.email);
            break;
            case "cardNumber":
            error = validateCardNumber(formData.cardNumber);
            break;
            case "expiryDate":
            error = validateExpiryDate(formData.expiryDate);
            break;
            case "cvc":
            error = validateCvc(formData.cvc);
            break;
            case "zipCode":
            error = validateZipCode(formData.zipCode);
            break;
        }
        
        if (error) {
            setErrors({ ...errors, [field]: error });
        }
    }, [touched, email, expiryDate, fullName, country, cvc, cardNumber, zipCode]);

    const validateAllFields = useCallback(() => {
        const newErrors: Record<string, string> = {};
        
        const fullNameError = validateFullName(formData.fullName);
        const emailError = validateEmail(formData.email);
        const cardNumberError = validateCardNumber(formData.cardNumber);
        const expiryError = validateExpiryDate(formData.expiryDate);
        const cvcError = validateCvc(formData.cvc);
        const zipError = validateZipCode(formData.zipCode);
        
        if (fullNameError) newErrors.fullName = fullNameError;
        if (emailError) newErrors.email = emailError;
        if (cardNumberError) newErrors.cardNumber = cardNumberError;
        if (expiryError) newErrors.expiryDate = expiryError;
        if (cvcError) newErrors.cvc = cvcError;
        if (zipError) newErrors.zipCode = zipError;
        
        setErrors(newErrors);
        setTouched({
            fullName: true,
            email: true,
            cardNumber: true,
            expiryDate: true,
            cvc: true,
            zipCode: true,
        });
        
        return Object.keys(newErrors).length === 0;
    }, [errors, email, expiryDate, fullName, country, cvc, cardNumber, zipCode]);

    const pricing = {
        monthly: { price: 20, priceWithTax: 23.4, discount: 0 },
        yearly: { price: 17, priceWithTax: 19.89, discount: 17 },
    };

    const currentPricing = pricing[billingCycle];
    const annualTotal = billingCycle === "yearly" ? currentPricing.priceWithTax * 12 : null;

    const handlePurchase = useCallback(async () => {
        if (!validateAllFields()) return;

        setIsProcessing(true);
        
        setTimeout(async () => {
            const res = await upgradePlan('pro');

            setIsProcessing(false);

            if (res) {
                navigate("/new");
            }
            
        }, 2000);
    }, [isProcessing, email, expiryDate, fullName, country, cvc, cardNumber, zipCode]);

    return {validateAllFields: validateAllFields, validateCardNumber: validateCardNumber, validateCvc: validateCvc, validateEmail: validateEmail, validateExpiryDate: validateExpiryDate, validateFullName: validateFullName, validateZipCode: validateZipCode, formatCardNumber: formatCardNumber, formatExpiryDate: formatExpiryDate, formatZipCode: formatZipCode, handleFieldBlur: handleFieldBlur, handleFieldChange: handleFieldChange, handlePurchase: handlePurchase, currentPricing: currentPricing, annualTotal: annualTotal, pricing: pricing}
}