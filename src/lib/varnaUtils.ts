export function getFormattedVarnaTitle(name: string | undefined, language: string): string {
  if (!name || !name.trim()) {
    return language === 'id' ? "Varna Kamu" : "Your Varna";
  }
  const cleanName = name.trim();
  if (language === 'id') {
    return `Varna-nya ${cleanName}`;
  } else {
    const suffix = cleanName.toLowerCase().endsWith('s') ? "'" : "'s";
    return `${cleanName}${suffix} Varna`;
  }
}
