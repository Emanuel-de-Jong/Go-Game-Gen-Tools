using IGOEnchi.GoGameLogic;
using IGOEnchi.GoGameSgf;
using IGOEnchi.SmartGameLib;
using Microsoft.Win32;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Josekis_Analyzer
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private GoGame game1;
        private GoGame game2;

        public MainWindow()
        {
            InitializeComponent();

            Debug();
        }

        private void Debug()
        {
            game1 = ReadSGF(@"D:\Other\Mega\MEGAsync\Go\Learning\AI\AI-Josekis-0.4\AI-Josekis-True-0.3-15-15-8-8-6.sgf");
            game2 = ReadSGF(@"D:\Other\Mega\MEGAsync\Go\Learning\AI\AI-Josekis-0.5\AI-Josekis-40-0.3-48-48-26-26-20.sgf");

            Analyze();
        }

        private void Game1Path_Click(object sender, RoutedEventArgs e)
        {
            game1 = ReadSGF(GetSGFPath());
        }

        private void Game2Path_Click(object sender, RoutedEventArgs e)
        {
            game2 = ReadSGF(GetSGFPath());

            Analyze();
        }

        private string GetSGFPath()
        {
            OpenFileDialog openFileDialog = new();

            bool? result = openFileDialog.ShowDialog();
            if (result == null || result == false)
                return null;

            return openFileDialog.FileName;
        }

        private GoGame ReadSGF(string sgfPath)
        {
            using var fileStream = File.OpenRead(sgfPath);

            var gameTree = SgfReader.LoadFromStream(fileStream);
            return SgfCompiler.Compile(gameTree);
        }

        private void Analyze()
        {
            Result.Text = Analyzer.CalculateSimilarity(game1, game2);
        }
    }
}