package com.crucibibia.app.util

/**
 * Helper class for Bible scripture references
 * Maps Italian book names to their number (1-66) for wol.jw.org links
 */
object BibleHelper {

    // Map of Italian book names to their number (1-66)
    private val bookNumbers = mapOf(
        // Old Testament
        "genesi" to 1,
        "gen" to 1,
        "ge" to 1,
        "esodo" to 2,
        "eso" to 2,
        "es" to 2,
        "levitico" to 3,
        "lev" to 3,
        "le" to 3,
        "numeri" to 4,
        "num" to 4,
        "nu" to 4,
        "deuteronomio" to 5,
        "deut" to 5,
        "de" to 5,
        "dt" to 5,
        "giosuè" to 6,
        "giosue" to 6,
        "gios" to 6,
        "gs" to 6,
        "giudici" to 7,
        "giud" to 7,
        "gdc" to 7,
        "rut" to 8,
        "ru" to 8,
        "1 samuele" to 9,
        "1samuele" to 9,
        "1 sam" to 9,
        "1sam" to 9,
        "2 samuele" to 10,
        "2samuele" to 10,
        "2 sam" to 10,
        "2sam" to 10,
        "1 re" to 11,
        "1re" to 11,
        "2 re" to 12,
        "2re" to 12,
        "1 cronache" to 13,
        "1cronache" to 13,
        "1 cron" to 13,
        "1cron" to 13,
        "2 cronache" to 14,
        "2cronache" to 14,
        "2 cron" to 14,
        "2cron" to 14,
        "esdra" to 15,
        "esd" to 15,
        "neemia" to 16,
        "nee" to 16,
        "ne" to 16,
        "ester" to 17,
        "est" to 17,
        "giobbe" to 18,
        "giob" to 18,
        "gb" to 18,
        "salmi" to 19,
        "salmo" to 19,
        "sal" to 19,
        "sl" to 19,
        "proverbi" to 20,
        "prov" to 20,
        "pr" to 20,
        "ecclesiaste" to 21,
        "eccl" to 21,
        "ec" to 21,
        "cantico dei cantici" to 22,
        "cantico" to 22,
        "cant" to 22,
        "ca" to 22,
        "isaia" to 23,
        "isa" to 23,
        "is" to 23,
        "geremia" to 24,
        "ger" to 24,
        "gr" to 24,
        "lamentazioni" to 25,
        "lam" to 25,
        "la" to 25,
        "ezechiele" to 26,
        "ezec" to 26,
        "ez" to 26,
        "daniele" to 27,
        "dan" to 27,
        "da" to 27,
        "osea" to 28,
        "ose" to 28,
        "os" to 28,
        "gioele" to 29,
        "gioe" to 29,
        "gl" to 29,
        "amos" to 30,
        "am" to 30,
        "abdia" to 31,
        "abd" to 31,
        "ab" to 31,
        "giona" to 32,
        "gio" to 32,
        "michea" to 33,
        "mic" to 33,
        "mi" to 33,
        "naum" to 34,
        "na" to 34,
        "abacuc" to 35,
        "abac" to 35,
        "sofonia" to 36,
        "sof" to 36,
        "so" to 36,
        "aggeo" to 37,
        "agg" to 37,
        "ag" to 37,
        "zaccaria" to 38,
        "zacc" to 38,
        "zc" to 38,
        "malachia" to 39,
        "mal" to 39,
        "ml" to 39,

        // New Testament
        "matteo" to 40,
        "matt" to 40,
        "mt" to 40,
        "marco" to 41,
        "mar" to 41,
        "mr" to 41,
        "mc" to 41,
        "luca" to 42,
        "luc" to 42,
        "lu" to 42,
        "lc" to 42,
        "giovanni" to 43,
        "giov" to 43,
        "gv" to 43,
        "atti" to 44,
        "at" to 44,
        "romani" to 45,
        "rom" to 45,
        "ro" to 45,
        "1 corinti" to 46,
        "1corinti" to 46,
        "1 cor" to 46,
        "1cor" to 46,
        "2 corinti" to 47,
        "2corinti" to 47,
        "2 cor" to 47,
        "2cor" to 47,
        "galati" to 48,
        "gal" to 48,
        "efesini" to 49,
        "efes" to 49,
        "ef" to 49,
        "filippesi" to 50,
        "fil" to 50,
        "flp" to 50,
        "colossesi" to 51,
        "col" to 51,
        "1 tessalonicesi" to 52,
        "1tessalonicesi" to 52,
        "1 tess" to 52,
        "1tess" to 52,
        "2 tessalonicesi" to 53,
        "2tessalonicesi" to 53,
        "2 tess" to 53,
        "2tess" to 53,
        "1 timoteo" to 54,
        "1timoteo" to 54,
        "1 tim" to 54,
        "1tim" to 54,
        "2 timoteo" to 55,
        "2timoteo" to 55,
        "2 tim" to 55,
        "2tim" to 55,
        "tito" to 56,
        "tit" to 56,
        "filemone" to 57,
        "filem" to 57,
        "flm" to 57,
        "ebrei" to 58,
        "ebr" to 58,
        "eb" to 58,
        "giacomo" to 59,
        "giac" to 59,
        "gc" to 59,
        "1 pietro" to 60,
        "1pietro" to 60,
        "1 pt" to 60,
        "1pt" to 60,
        "2 pietro" to 61,
        "2pietro" to 61,
        "2 pt" to 61,
        "2pt" to 61,
        "1 giovanni" to 62,
        "1giovanni" to 62,
        "1 gv" to 62,
        "1gv" to 62,
        "2 giovanni" to 63,
        "2giovanni" to 63,
        "2 gv" to 63,
        "2gv" to 63,
        "3 giovanni" to 64,
        "3giovanni" to 64,
        "3 gv" to 64,
        "3gv" to 64,
        "giuda" to 65,
        "rivelazione" to 66,
        "riv" to 66,
        "apocalisse" to 66,
        "apoc" to 66,
        "ap" to 66
    )

    /**
     * Data class to hold parsed scripture reference
     */
    data class ScriptureReference(
        val bookNumber: Int,
        val chapter: Int,
        val verses: String? = null
    ) {
        fun toWolUrl(): String {
            return "https://wol.jw.org/it/wol/b/r6/lp-i/nwtsty/$bookNumber/$chapter#study=discover"
        }
    }

    /**
     * Parse a scripture reference from text
     * Examples: "Isaia 19:9, 10", "Gen 1:1", "Salmo 23:1"
     * Returns null if no valid reference found
     */
    fun parseScriptureReference(text: String): ScriptureReference? {
        // Pattern to match scripture references like "Isaia 19:9" or "1 Samuele 17:45"
        // Also matches abbreviated forms like "Is 19:9" or "1Sam 17:45"
        val pattern = Regex(
            """(\d?\s?[A-Za-zÀ-ÿ]+)\s+(\d+)(?::(\d+(?:[,\-–]\s?\d+)*))?""",
            RegexOption.IGNORE_CASE
        )

        val match = pattern.find(text) ?: return null

        val bookName = match.groupValues[1].trim().lowercase()
        val chapter = match.groupValues[2].toIntOrNull() ?: return null
        val verses = match.groupValues.getOrNull(3)?.takeIf { it.isNotEmpty() }

        val bookNumber = bookNumbers[bookName] ?: return null

        return ScriptureReference(bookNumber, chapter, verses)
    }

    /**
     * Extract all scripture references from a clue text
     */
    fun extractAllReferences(text: String): List<ScriptureReference> {
        val results = mutableListOf<ScriptureReference>()

        // Pattern for scripture references
        val pattern = Regex(
            """(\d?\s?[A-Za-zÀ-ÿ]+)\s+(\d+)(?::(\d+(?:[,\-–]\s?\d+)*))?""",
            RegexOption.IGNORE_CASE
        )

        pattern.findAll(text).forEach { match ->
            val bookName = match.groupValues[1].trim().lowercase()
            val chapter = match.groupValues[2].toIntOrNull()
            val verses = match.groupValues.getOrNull(3)?.takeIf { it.isNotEmpty() }

            if (chapter != null) {
                bookNumbers[bookName]?.let { bookNumber ->
                    results.add(ScriptureReference(bookNumber, chapter, verses))
                }
            }
        }

        return results
    }

    /**
     * Check if text contains a scripture reference
     */
    fun containsScriptureReference(text: String): Boolean {
        return parseScriptureReference(text) != null
    }

    /**
     * Get the wol.jw.org URL for the first scripture reference in text
     */
    fun getWolUrl(text: String): String? {
        return parseScriptureReference(text)?.toWolUrl()
    }
}
