export const countryService = {
  getCountryFlag(countryCode: string): string {
    const flagMap: Record<string, string> = {
      NG: "/images/flags/nigeria.jpg",
      GH: "/images/flags/ghana.jpg",
      KE: "/images/flags/kenya.jpg",
      ZA: "/images/flags/south-africa.jpg",
      EG: "/images/flags/egypt.jpg",
      MA: "/images/flags/morocco.jpg",
      DZ: "/images/flags/algeria.jpg",
      TN: "/images/flags/tunisia.jpg",
      ET: "/images/flags/ethiopia.jpg",
      TZ: "/images/flags/tanzania.jpg",
      UG: "/images/flags/uganda.jpg",
      RW: "/images/flags/rwanda.jpg",
      ZM: "/images/flags/zambia.jpg",
      ZW: "/images/flags/zimbabwe.jpg",
    }
    return flagMap[countryCode] || "/placeholder.svg"
  },

  getCountryName(countryCode: string): string {
    const countryMap: Record<string, string> = {
      NG: "Nigeria",
      GH: "Ghana",
      KE: "Kenya",
      ZA: "South Africa",
      EG: "Egypt",
      MA: "Morocco",
      DZ: "Algeria",
      TN: "Tunisia",
      ET: "Ethiopia",
      TZ: "Tanzania",
      UG: "Uganda",
      RW: "Rwanda",
      ZM: "Zambia",
      ZW: "Zimbabwe",
    }
    return countryMap[countryCode] || countryCode
  },
}
