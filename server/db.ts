// Local Football Players and Clubs Database for fast querying

export interface Club {
  name: string;
  shortName: string;
  primaryColor: string; // Tailwind color class or Hex
  secondaryColor: string; // Tailwind color class or Hex
  textColor: string; // text contrast color
  logoEmoji: string; // soccer-related emoji or shield symbol
  league: string;
}

export interface Player {
  id: string;
  displayName: string;
  searchNames: string[]; // lowercase names for searching
  teams: string[]; // names of clubs they played for (must match Club shortName or name)
  activeYears: Record<string, string>; // e.g., "Galatasaray": "2022-present"
}

export const CLUBS: Record<string, Club> = {
  "Galatasaray": {
    name: "Galatasaray SK",
    shortName: "Galatasaray",
    primaryColor: "#E30A17", // Yellow-Red (Amber & Crimson)
    secondaryColor: "#FDB912",
    textColor: "#FFFFFF",
    logoEmoji: "🦁",
    league: "Trendyol Süper Lig"
  },
  "Fenerbahçe": {
    name: "Fenerbahçe SK",
    shortName: "Fenerbahçe",
    primaryColor: "#00205B", // Navy-Yellow
    secondaryColor: "#FFD100",
    textColor: "#FFFFFF",
    logoEmoji: "🐤",
    league: "Trendyol Süper Lig"
  },
  "Beşiktaş": {
    name: "Beşiktaş JK",
    shortName: "Beşiktaş",
    primaryColor: "#000000", // Black-White
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "🦅",
    league: "Trendyol Süper Lig"
  },
  "Barcelona": {
    name: "FC Barcelona",
    shortName: "Barcelona",
    primaryColor: "#004D98", // Blaugrana
    secondaryColor: "#A50044",
    textColor: "#FFFFFF",
    logoEmoji: "🔵🔴",
    league: "La Liga"
  },
  "Real Madrid": {
    name: "Real Madrid CF",
    shortName: "Real Madrid",
    primaryColor: "#FFFFFF", // White-Gold
    secondaryColor: "#FEBE10",
    textColor: "#1C355E",
    logoEmoji: "👑",
    league: "La Liga"
  },
  "PSG": {
    name: "Paris Saint-Germain FC",
    shortName: "PSG",
    primaryColor: "#001C53", // Navy-Red
    secondaryColor: "#E30613",
    textColor: "#FFFFFF",
    logoEmoji: "🗼",
    league: "Ligue 1"
  },
  "Manchester United": {
    name: "Manchester United FC",
    shortName: "Manchester United",
    primaryColor: "#DA291C", // Red Devils
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    logoEmoji: "😈",
    league: "Premier League"
  },
  "Chelsea": {
    name: "Chelsea FC",
    shortName: "Chelsea",
    primaryColor: "#034694", // Blue
    secondaryColor: "#EE242C",
    textColor: "#FFFFFF",
    logoEmoji: "🦁",
    league: "Premier League"
  },
  "Manchester City": {
    name: "Manchester City FC",
    shortName: "Manchester City",
    primaryColor: "#6CABDD", // Sky Blue
    secondaryColor: "#1C2C5B",
    textColor: "#FFFFFF",
    logoEmoji: "⛵",
    league: "Premier League"
  },
  "Arsenal": {
    name: "Arsenal FC",
    shortName: "Arsenal",
    primaryColor: "#EF0107", // Red-White
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "🔴",
    league: "Premier League"
  },
  "Liverpool": {
    name: "Liverpool FC",
    shortName: "Liverpool",
    primaryColor: "#C8102E", // Red
    secondaryColor: "#F6EB61",
    textColor: "#FFFFFF",
    logoEmoji: "🔴",
    league: "Premier League"
  },
  "Inter Milan": {
    name: "FC Internazionale Milano",
    shortName: "Inter Milan",
    primaryColor: "#0066B2", // Black-Blue
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    logoEmoji: "🐍",
    league: "Serie A"
  },
  "AC Milan": {
    name: "AC Milan",
    shortName: "AC Milan",
    primaryColor: "#E30613", // Black-Red
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    logoEmoji: "😈",
    league: "Serie A"
  },
  "Juventus": {
    name: "Juventus FC",
    shortName: "Juventus",
    primaryColor: "#000000", // Black-White
    secondaryColor: "#FFFFFF",
    textColor: "#000000",
    logoEmoji: "🦓",
    league: "Serie A"
  },
  "Roma": {
    name: "AS Roma",
    shortName: "Roma",
    primaryColor: "#8E1B34", // Giallorossi
    secondaryColor: "#F3AF19",
    textColor: "#FFFFFF",
    logoEmoji: "🐺",
    league: "Serie A"
  },
  "Lazio": {
    name: "SS Lazio",
    shortName: "Lazio",
    primaryColor: "#87D8F7", // Biancocelesti
    secondaryColor: "#FFFFFF",
    textColor: "#000000",
    logoEmoji: "🦅",
    league: "Serie A"
  },
  "Napoli": {
    name: "SSC Napoli",
    shortName: "Napoli",
    primaryColor: "#12A0D7", // Azzurri
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "🔵",
    league: "Serie A"
  },
  "Atletico Madrid": {
    name: "Atlético de Madrid",
    shortName: "Atletico Madrid",
    primaryColor: "#CB3524", // Red-White
    secondaryColor: "#192243",
    textColor: "#FFFFFF",
    logoEmoji: "🐻",
    league: "La Liga"
  },
  "Bayern Munich": {
    name: "FC Bayern München",
    shortName: "Bayern Munich",
    primaryColor: "#DC052D", // Red-Blue
    secondaryColor: "#0066B2",
    textColor: "#FFFFFF",
    logoEmoji: "🔴",
    league: "Bundesliga"
  },
  "Dortmund": {
    name: "Borussia Dortmund",
    shortName: "Dortmund",
    primaryColor: "#FDE100", // Black-Yellow
    secondaryColor: "#000000",
    textColor: "#000000",
    logoEmoji: "🐝",
    league: "Bundesliga"
  },
  "Porto": {
    name: "FC Porto",
    shortName: "Porto",
    primaryColor: "#005CA9", // Blue-White
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "🐉",
    league: "Liga Portugal"
  },
  "Benfica": {
    name: "SL Benfica",
    shortName: "Benfica",
    primaryColor: "#E30613", // Red-White
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "🦅",
    league: "Liga Portugal"
  },
  "Sporting CP": {
    name: "Sporting CP",
    shortName: "Sporting CP",
    primaryColor: "#008057", // Green-White
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "🦁",
    league: "Liga Portugal"
  },
  "Ajax": {
    name: "AFC Ajax",
    shortName: "Ajax",
    primaryColor: "#D2122E", // Red-White
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "❌❌❌",
    league: "Eredivisie"
  },
  "Feyenoord": {
    name: "Feyenoord Rotterdam",
    shortName: "Feyenoord",
    primaryColor: "#E30613", // Red-White
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "🔴⚪",
    league: "Eredivisie"
  },
  "Al Nassr": {
    name: "Al Nassr FC",
    shortName: "Al Nassr",
    primaryColor: "#FFF200", // Yellow-Blue
    secondaryColor: "#005CA9",
    textColor: "#000000",
    logoEmoji: "👑",
    league: "Saudi Pro League"
  },
  "Inter Miami": {
    name: "Inter Miami CF",
    shortName: "Inter Miami",
    primaryColor: "#F4B5CD", // Pink-Black
    secondaryColor: "#231F20",
    textColor: "#000000",
    logoEmoji: "🦩",
    league: "MLS"
  },
  "Tottenham": {
    name: "Tottenham Hotspur FC",
    shortName: "Tottenham",
    primaryColor: "#132257", // Navy-White
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    logoEmoji: "🐓",
    league: "Premier League"
  }
};

export const PLAYERS: Player[] = [
  {
    id: "messi",
    displayName: "Lionel Messi",
    searchNames: ["lionel messi", "messi", "l. messi", "leo messi"],
    teams: ["Barcelona", "PSG", "Inter Miami"],
    activeYears: {
      "Barcelona": "2004-2021",
      "PSG": "2021-2023",
      "Inter Miami": "2023-present"
    }
  },
  {
    id: "neymar",
    displayName: "Neymar Jr",
    searchNames: ["neymar jr", "neymar", "neymar da silva santos júnior", "ney"],
    teams: ["Barcelona", "PSG", "Al Nassr"], // Simplified Al Hilal to Al Nassr for matching, or we can use Al Nassr as generic Saudi representation or add Al Hilal
    activeYears: {
      "Barcelona": "2013-2017",
      "PSG": "2017-2023"
    }
  },
  {
    id: "suarez",
    displayName: "Luis Suárez",
    searchNames: ["luis suarez", "suarez", "luis suárez", "l. suarez"],
    teams: ["Ajax", "Liverpool", "Barcelona", "Atletico Madrid", "Inter Miami"],
    activeYears: {
      "Ajax": "2007-2011",
      "Liverpool": "2011-2014",
      "Barcelona": "2014-2020",
      "Atletico Madrid": "2020-2022",
      "Inter Miami": "2024-present"
    }
  },
  {
    id: "ronaldo",
    displayName: "Cristiano Ronaldo",
    searchNames: ["cristiano ronaldo", "ronaldo", "cr7", "c. ronaldo"],
    teams: ["Sporting CP", "Manchester United", "Real Madrid", "Juventus", "Al Nassr"],
    activeYears: {
      "Sporting CP": "2002-2003",
      "Manchester United": "2003-2009, 2021-2022",
      "Real Madrid": "2009-2018",
      "Juventus": "2018-2021",
      "Al Nassr": "2023-present"
    }
  },
  {
    id: "benzema",
    displayName: "Karim Benzema",
    searchNames: ["karim benzema", "benzema", "k. benzema"],
    teams: ["Real Madrid"],
    activeYears: {
      "Real Madrid": "2009-2023"
    }
  },
  {
    id: "modric",
    displayName: "Luka Modrić",
    searchNames: ["luka modric", "modric", "luka modrić", "l. modric"],
    teams: ["Tottenham", "Real Madrid"],
    activeYears: {
      "Tottenham": "2008-2012",
      "Real Madrid": "2012-present"
    }
  },
  {
    id: "kroos",
    displayName: "Toni Kroos",
    searchNames: ["toni kroos", "kroos", "t. kroos"],
    teams: ["Bayern Munich", "Real Madrid"],
    activeYears: {
      "Bayern Munich": "2007-2014",
      "Real Madrid": "2014-2024"
    }
  },
  {
    id: "ibrahimovic",
    displayName: "Zlatan Ibrahimović",
    searchNames: ["zlatan ibrahimovic", "ibrahimovic", "zlatan", "zlatan ibrahimović", "ibra"],
    teams: ["Ajax", "Juventus", "Inter Milan", "Barcelona", "AC Milan", "PSG", "Manchester United"],
    activeYears: {
      "Ajax": "2001-2004",
      "Juventus": "2004-2006",
      "Inter Milan": "2006-2009",
      "Barcelona": "2009-2010",
      "AC Milan": "2010-2012, 2020-2023",
      "PSG": "2012-2016",
      "Manchester United": "2016-2018"
    }
  },
  {
    id: "icardi",
    displayName: "Mauro Icardi",
    searchNames: ["mauro icardi", "icardi", "m. icardi"],
    teams: ["Inter Milan", "PSG", "Galatasaray"],
    activeYears: {
      "Inter Milan": "2013-2019",
      "PSG": "2019-2022",
      "Galatasaray": "2022-present"
    }
  },
  {
    id: "muslera",
    displayName: "Fernando Muslera",
    searchNames: ["fernando muslera", "muslera", "f. muslera", "nando"],
    teams: ["Lazio", "Galatasaray"],
    activeYears: {
      "Lazio": "2007-2011",
      "Galatasaray": "2011-present"
    }
  },
  {
    id: "osimhen",
    displayName: "Victor Osimhen",
    searchNames: ["victor osimhen", "osimhen", "v. osimhen"],
    teams: ["Napoli", "Galatasaray"],
    activeYears: {
      "Napoli": "2020-2024",
      "Galatasaray": "2024-present"
    }
  },
  {
    id: "mertens",
    displayName: "Dries Mertens",
    searchNames: ["dries mertens", "mertens", "d. mertens"],
    teams: ["Napoli", "Galatasaray"],
    activeYears: {
      "Napoli": "2013-2022",
      "Galatasaray": "2022-present"
    }
  },
  {
    id: "dzeko",
    displayName: "Edin Džeko",
    searchNames: ["edin dzeko", "dzeko", "edin džeko", "e. dzeko"],
    teams: ["Manchester City", "Roma", "Inter Milan", "Fenerbahçe"],
    activeYears: {
      "Manchester City": "2011-2015",
      "Roma": "2015-2021",
      "Inter Milan": "2021-2023",
      "Fenerbahçe": "2023-present"
    }
  },
  {
    id: "tadic",
    displayName: "Dušan Tadić",
    searchNames: ["dusan tadic", "tadic", "dušan tadić", "d. tadic"],
    teams: ["Ajax", "Fenerbahçe"],
    activeYears: {
      "Ajax": "2018-2023",
      "Fenerbahçe": "2023-present"
    }
  },
  {
    id: "fred",
    displayName: "Fred",
    searchNames: ["fred", "frederico rodrigues de paula santos"],
    teams: ["Manchester United", "Fenerbahçe"],
    activeYears: {
      "Manchester United": "2018-2023",
      "Fenerbahçe": "2023-present"
    }
  },
  {
    id: "immobile",
    displayName: "Ciro Immobile",
    searchNames: ["ciro immobile", "immobile", "c. immobile"],
    teams: ["Juventus", "Dortmund", "Lazio", "Beşiktaş"],
    activeYears: {
      "Juventus": "2009-2010",
      "Dortmund": "2014-2015",
      "Lazio": "2016-2024",
      "Beşiktaş": "2024-present"
    }
  },
  {
    id: "rafasilva",
    displayName: "Rafa Silva",
    searchNames: ["rafa silva", "rafa", "r. silva"],
    teams: ["Benfica", "Beşiktaş"],
    activeYears: {
      "Benfica": "2016-2024",
      "Beşiktaş": "2024-present"
    }
  },
  {
    id: "gedson",
    displayName: "Gedson Fernandes",
    searchNames: ["gedson fernandes", "gedson", "g. fernandes"],
    teams: ["Benfica", "Tottenham", "Galatasaray", "Beşiktaş"],
    activeYears: {
      "Benfica": "2018-2022",
      "Tottenham": "2020-2021",
      "Galatasaray": "2021",
      "Beşiktaş": "2022-present"
    }
  },
  {
    id: "ardaturan",
    displayName: "Arda Turan",
    searchNames: ["arda turan", "arda", "a. turan"],
    teams: ["Galatasaray", "Atletico Madrid", "Barcelona"],
    activeYears: {
      "Galatasaray": "2005-2011, 2020-2022",
      "Atletico Madrid": "2011-2015",
      "Barcelona": "2015-2020"
    }
  },
  {
    id: "drogba",
    displayName: "Didier Drogba",
    searchNames: ["didier drogba", "drogba", "d. drogba"],
    teams: ["Chelsea", "Galatasaray"],
    activeYears: {
      "Chelsea": "2004-2012, 2014-2015",
      "Galatasaray": "2013-2014"
    }
  },
  {
    id: "sneijder",
    displayName: "Wesley Sneijder",
    searchNames: ["wesley sneijder", "sneijder", "w. sneijder"],
    teams: ["Ajax", "Real Madrid", "Inter Milan", "Galatasaray"],
    activeYears: {
      "Ajax": "2002-2007",
      "Real Madrid": "2007-2009",
      "Inter Milan": "2009-2013",
      "Galatasaray": "2013-2017"
    }
  },
  {
    id: "vanpersie",
    displayName: "Robin van Persie",
    searchNames: ["robin van persie", "van persie", "rvp", "r. van persie"],
    teams: ["Feyenoord", "Arsenal", "Manchester United", "Fenerbahçe"],
    activeYears: {
      "Feyenoord": "2001-2004, 2018-2019",
      "Arsenal": "2004-2012",
      "Manchester United": "2012-2015",
      "Fenerbahçe": "2015-2018"
    }
  },
  {
    id: "ozil",
    displayName: "Mesut Özil",
    searchNames: ["mesut ozil", "mesut özil", "ozil", "özil", "m. ozil"],
    teams: ["Real Madrid", "Arsenal", "Fenerbahçe"],
    activeYears: {
      "Real Madrid": "2010-2013",
      "Arsenal": "2013-2021",
      "Fenerbahçe": "2021-2022"
    }
  },
  {
    id: "pepe",
    displayName: "Pepe",
    searchNames: ["pepe", "kepler laveran lima ferreira"],
    teams: ["Porto", "Real Madrid", "Beşiktaş"],
    activeYears: {
      "Porto": "2004-2007, 2019-2024",
      "Real Madrid": "2007-2017",
      "Beşiktaş": "2017-2018"
    }
  },
  {
    id: "quaresma",
    displayName: "Ricardo Quaresma",
    searchNames: ["ricardo quaresma", "quaresma", "r. quaresma", "q7"],
    teams: ["Sporting CP", "Barcelona", "Porto", "Chelsea", "Inter Milan", "Beşiktaş"],
    activeYears: {
      "Sporting CP": "2001-2003",
      "Barcelona": "2003-2004",
      "Porto": "2004-2008, 2014-2015",
      "Chelsea": "2009",
      "Inter Milan": "2008-2010",
      "Beşiktaş": "2010-2012, 2015-2019"
    }
  },
  {
    id: "talisca",
    displayName: "Anderson Talisca",
    searchNames: ["anderson talisca", "talisca", "a. talisca"],
    teams: ["Benfica", "Beşiktaş", "Al Nassr"],
    activeYears: {
      "Benfica": "2014-2016",
      "Beşiktaş": "2016-2018",
      "Al Nassr": "2021-present"
    }
  },
  {
    id: "batshuayi",
    displayName: "Michy Batshuayi",
    searchNames: ["michy batshuayi", "batshuayi", "m. batshuayi", "batsman", "bats"],
    teams: ["Chelsea", "Dortmund", "Beşiktaş", "Fenerbahçe", "Galatasaray"],
    activeYears: {
      "Chelsea": "2016-2022",
      "Dortmund": "2018",
      "Beşiktaş": "2021-2022",
      "Fenerbahçe": "2022-2024",
      "Galatasaray": "2024-present"
    }
  }
];

export function findLocalPlayer(query: string): Player | null {
  const norm = query.toLowerCase().trim();
  if (!norm) return null;
  
  // Try exact displayName match
  const exact = PLAYERS.find(p => p.displayName.toLowerCase() === norm);
  if (exact) return exact;

  // Try searchNames match
  const aliasMatch = PLAYERS.find(p => p.searchNames.includes(norm));
  if (aliasMatch) return aliasMatch;

  // Try partial match
  const partialMatch = PLAYERS.find(p => p.searchNames.some(name => name.includes(norm) || norm.includes(name)));
  if (partialMatch) return partialMatch;

  return null;
}
