namespace TempAPI
{
    public static class G
    {
        public static bool Log =
            #if DEBUG
                true;
            #else
                false;
            #endif
    }
}
