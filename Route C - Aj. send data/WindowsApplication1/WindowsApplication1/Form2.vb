Public Class Form2

    Sub Form2_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        TextBox1.Text = Form1.Label14.Text
    End Sub

    Private Sub TextBox2_TextChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles TextBox2.TextChanged
        If Keys.Enter Then
2:          If TextBox2.Text = "medprime" Then
                TextBox1.Enabled = True
                TextBox2.Enabled = False
            End If
3:
        End If
    End Sub

    Private Sub Button1_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Button1.Click
        Form1.Label14.Text = TextBox1.Text
        Me.Close()
    End Sub
End Class